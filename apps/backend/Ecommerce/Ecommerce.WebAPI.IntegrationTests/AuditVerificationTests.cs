using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Reflection;
using System.Text.Json;
using System.Text.Json.Nodes;
using Ecommerce.Application.Common.Configs;
using Ecommerce.Application.Features.Orders.Commands.UpdateOrderStatus;
using Ecommerce.Application.Features.Reports.Queries.GetRevenueByMonth;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Events;
using Ecommerce.Infrastructure.Persistence;
using Ecommerce.Infrastructure.Services;
using MediatR;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Options;

namespace Ecommerce.WebAPI.IntegrationTests;

/// <summary>
/// Verification tests for the "critical findings" in docs/architecture-audit (13-critical-findings-verification.md).
/// Every test asserts the CORRECT / EXPECTED behaviour. A FAILING test therefore means the finding is reproduced.
/// Run only these with:  dotnet test --filter "Category=AuditRepro"
/// Exclude from normal runs with: --filter "Category!=AuditRepro"
/// </summary>
public sealed class AuditVerificationTests : IDisposable
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);
    private readonly CustomWebApplicationFactory _factory = new();

    private HttpClient NewClient(bool handleCookies = false) =>
        _factory.CreateClient(new Microsoft.AspNetCore.Mvc.Testing.WebApplicationFactoryClientOptions
        {
            BaseAddress = new Uri("https://localhost"),
            AllowAutoRedirect = false,
            HandleCookies = handleCookies
        });

    // ───────────────────────── SEC-03 ─────────────────────────
    // [Authorize] is declared on the HANDLER of ExportProductsTemplateCommand and the controller attribute is commented out.
    // AuthorizationBehavior only reads attributes of the REQUEST type, so nothing enforces authentication.
    [Fact]
    [Trait("Category", "AuditRepro")]
    public async Task SEC03_Anonymous_CannotDownloadProductImportTemplate()
    {
        using var client = NewClient();

        var response = await client.GetAsync("/api/products/export-template?format=csv");

        Assert.True(
            response.StatusCode is HttpStatusCode.Unauthorized or HttpStatusCode.Forbidden,
            $"Anonymous request returned {(int)response.StatusCode} (expected 401/403).");
    }

    // ───────────────────────── SEC-04 ─────────────────────────
    // Browser behaviour after 15 min: access_token cookie has expired and is no longer sent; only refresh_token (Path=/api) is sent.
    [Fact]
    [Trait("Category", "AuditRepro")]
    public async Task SEC04_RefreshToken_WorksWhenOnlyRefreshCookieIsPresent()
    {
        using var loginClient = NewClient();
        var login = await loginClient.PostAsJsonAsync("/api/auth/login", new
        {
            Email = "customer@example.com",
            Password = "Customer@123"
        }, JsonOptions);
        Assert.Equal(HttpStatusCode.OK, login.StatusCode);

        var body = await login.Content.ReadFromJsonAsync<JsonObject>(JsonOptions);
        var refreshToken = body?["data"]?["refreshToken"]?.GetValue<string>();
        Assert.False(string.IsNullOrWhiteSpace(refreshToken));

        using var browserAfterExpiry = NewClient();
        using var request = new HttpRequestMessage(HttpMethod.Post, "/api/auth/refresh-token")
        {
            Content = JsonContent.Create(new { }, options: JsonOptions)
        };
        request.Headers.Add("Cookie", $"refresh_token={refreshToken}");

        var response = await browserAfterExpiry.SendAsync(request);

        Assert.True(
            response.StatusCode == HttpStatusCode.OK,
            $"Refresh with only refresh_token cookie returned {(int)response.StatusCode} (expected 200).");
    }

    // ───────────────────────── DATA-01 ─────────────────────────
    [Fact]
    [Trait("Category", "AuditRepro")]
    public async Task DATA01_AddingTwoVariantsOfSameProduct_KeepsBothCartLines()
    {
        using var client = NewClient();
        var login = await client.PostAsJsonAsync("/api/auth/login", new
        {
            Email = "customer@example.com",
            Password = "Customer@123"
        }, JsonOptions);
        Assert.Equal(HttpStatusCode.OK, login.StatusCode);
        var accessToken = (await login.Content.ReadFromJsonAsync<JsonObject>(JsonOptions))?["data"]?["accessToken"]?.GetValue<string>();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

        Guid productId;
        using (var scope = _factory.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            productId = await db.Products.AsNoTracking()
                .Where(p => !p.HasVariants && p.StockQuantity >= 10)
                .Select(p => p.Id)
                .FirstAsync();
        }

        var first = await client.PostAsJsonAsync("/api/cart/items",
            new { ProductId = productId, Quantity = 1, Color = "Red", Size = "M" }, JsonOptions);
        var second = await client.PostAsJsonAsync("/api/cart/items",
            new { ProductId = productId, Quantity = 1, Color = "Blue", Size = "L" }, JsonOptions);

        Assert.True(first.IsSuccessStatusCode, $"First add returned {(int)first.StatusCode}.");
        Assert.True(second.IsSuccessStatusCode,
            $"Second add (different Color/Size, same product) returned {(int)second.StatusCode}.");

        using var verify = _factory.CreateScope();
        var verifyDb = verify.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var lines = await verifyDb.Set<CartItem>().AsNoTracking().CountAsync(ci => ci.ProductId == productId);
        Assert.Equal(2, lines);
    }

    // ───────────────────────── FLOW-02 ─────────────────────────
    // Order contains a variant SKU line. Checkout decremented SKU stock. Cancelling must give the stock back to the SKU.
    [Fact]
    public async Task FLOW02_CancellingOrderWithVariantSku_RestoresSkuStock()
    {
        Guid orderId;
        Guid skuId;
        Guid productId;
        byte[] token;

        using (var scope = _factory.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var admin = await db.Users.SingleAsync(u => u.Email == "admin@Ecommerce.com");
            var seed = await db.Products.AsNoTracking().Select(p => new { p.CategoryId, p.BrandId }).FirstAsync();

            var product = Product.Create(
                $"P-{Guid.NewGuid():N}"[..20], "Audit variant product", $"audit-{Guid.NewGuid():N}"[..30],
                $"SKU-{Guid.NewGuid():N}"[..32], 1000m, null, "products/test.png", "audit", 0,
                seed.CategoryId, seed.BrandId);
            product.Id = Guid.NewGuid();
            product.EnableVariants();

            var sku = ProductVariantSku.Create(product.Id, $"SKU-{Guid.NewGuid():N}", 1000m, null, 5);
            sku.Id = Guid.NewGuid();

            var order = Order.Create(admin.Id, "Owner User", "owner@example.com", "0909000000",
                "123 Owner Street", null, null, null, $"ORD-{Guid.NewGuid():N}"[..20]);
            order.AddOrderItem(product.Id, product.Name, product.Image, 1000m, 2, "Red", "M", sku.Id, sku.Sku, "Red / M");

            db.Products.Add(product);
            db.ProductVariantSkus.Add(sku);
            db.Orders.Add(order);
            await db.SaveChangesAsync();

            // Simulate what CreateOrderCommandHandler did at checkout: SKU stock 5 -> 3.
            await db.ProductVariantSkus.Where(s => s.Id == sku.Id)
                .ExecuteUpdateAsync(s => s.SetProperty(x => x.StockQuantity, 3));

            orderId = order.Id;
            skuId = sku.Id;
            productId = product.Id;
            token = (await db.Orders.AsNoTracking().SingleAsync(o => o.Id == order.Id)).ConcurrencyToken;
        }

        using (var scope = _factory.CreateScope())
        {
            var mediator = scope.ServiceProvider.GetRequiredService<IMediator>();
            var result = await mediator.Send(new UpdateOrderStatusCommand
            {
                Id = orderId,
                Status = EOrderStatus.Cancelled,
                RowVersion = Convert.ToBase64String(token)
            });
            Assert.True(result.IsSuccess, $"Cancel failed: {result.Error}");
        }

        using var verify = _factory.CreateScope();
        var verifyDb = verify.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var skuStock = await verifyDb.ProductVariantSkus.AsNoTracking().Where(s => s.Id == skuId).Select(s => s.StockQuantity).SingleAsync();
        var productStock = await verifyDb.Products.AsNoTracking().Where(p => p.Id == productId).Select(p => p.StockQuantity).SingleAsync();

        Assert.True(skuStock == 5,
            $"SKU stock after cancel = {skuStock} (expected 5). Product.StockQuantity = {productStock} (was 0 before cancel).");
    }

    // ───────────────────────── FLOW-03 ─────────────────────────
    [Fact]
    public void FLOW03_ReturnRequestCompletedEvent_HasAtLeastOneHandler()
    {
        var applicationAssembly = typeof(Ecommerce.Application.Features.Orders.EventHandlers.OrderStatusChangedEventHandler).Assembly;

        var handlers = applicationAssembly.GetTypes()
            .Where(t => t.GetInterfaces().Any(i =>
                i.IsGenericType &&
                i.GetGenericTypeDefinition() == typeof(INotificationHandler<>) &&
                i.GetGenericArguments()[0] == typeof(ReturnRequestCompletedEvent)))
            .Select(t => t.Name)
            .ToList();

        Assert.True(handlers.Count > 0, "No INotificationHandler<ReturnRequestCompletedEvent> exists in Ecommerce.Application.");
    }

    // ───────────────────────── PERF/correctness: revenue by month ─────────────────────────
    [Fact]
    [Trait("Category", "AuditRepro")]
    public async Task REPORT_RevenueByMonth_IncludesOrdersPlacedOnLastDayOfMonth()
    {
        using (var scope = _factory.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var admin = await db.Users.SingleAsync(u => u.Email == "admin@Ecommerce.com");
            var product = await db.Products.AsNoTracking().FirstAsync();

            var order = Order.Create(admin.Id, "Owner User", "owner@example.com", "0909000000",
                "123 Owner Street", null, null, null, $"ORD-{Guid.NewGuid():N}"[..20]);
            order.AddOrderItem(product.Id, product.Name, product.Image, 1000m, 2, null, null);
            db.Orders.Add(order);
            db.Entry(order).Property(nameof(Order.OrderDate)).CurrentValue = new DateTime(2025, 3, 31, 12, 0, 0, DateTimeKind.Utc);
            db.Entry(order).Property(nameof(Order.Status)).CurrentValue = EOrderStatus.Completed;
            await db.SaveChangesAsync();
        }

        using var querying = _factory.CreateScope();
        var mediator = querying.ServiceProvider.GetRequiredService<IMediator>();
        var result = await mediator.Send(new GetRevenueByMonthQuery { Year = 2025, MonthsCount = 12 });

        Assert.True(result.IsSuccess, result.Error);
        var march = result.Value!.Single(m => m.Month == 3 && m.Year == 2025);
        Assert.True(march.Total >= 2000m, $"March 2025 revenue = {march.Total}; the 31-Mar 12:00 order (2 x 1000) was not counted.");
    }

    // ───────────────────────── SEC-02 (latent) ─────────────────────────
    // FileStorageService is NOT registered in DI (SupabaseStorageService is), so this proves a latent defect only.
    [Fact]
    [Trait("Category", "AuditRepro")]
    public async Task SEC02_LocalFileStorage_DeleteFileAsync_RejectsPathTraversal()
    {
        var sandbox = Path.Combine(Path.GetTempPath(), "audit-sec02-" + Guid.NewGuid().ToString("N"));
        var contentRoot = Path.Combine(sandbox, "content");
        var webRoot = Path.Combine(contentRoot, "wwwroot");
        Directory.CreateDirectory(webRoot);
        var outsideFile = Path.Combine(contentRoot, "outside-secret.txt");
        await File.WriteAllTextAsync(outsideFile, "must survive");

        try
        {
            var service = new FileStorageService(
                new FakeWebHostEnvironment(contentRoot, webRoot),
                Options.Create(new FileStorageConfig { UploadFolder = "uploads", AppUrl = "https://localhost" }));

            var deleted = await service.DeleteFileAsync("../outside-secret.txt");

            Assert.True(File.Exists(outsideFile),
                $"DeleteFileAsync returned {deleted} and removed a file located OUTSIDE wwwroot.");
        }
        finally
        {
            if (Directory.Exists(sandbox)) Directory.Delete(sandbox, recursive: true);
        }
    }

    public void Dispose() => _factory.Dispose();

    private sealed class FakeWebHostEnvironment(string contentRoot, string webRoot) : IWebHostEnvironment
    {
        public string ApplicationName { get; set; } = "AuditSandbox";
        public IFileProvider ContentRootFileProvider { get; set; } = new NullFileProvider();
        public string ContentRootPath { get; set; } = contentRoot;
        public string EnvironmentName { get; set; } = "Development";
        public string WebRootPath { get; set; } = webRoot;
        public IFileProvider WebRootFileProvider { get; set; } = new NullFileProvider();
    }
}

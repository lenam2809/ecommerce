using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Nodes;
using Ecommerce.Application.Common.Configs;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Reports.Dto;
using Ecommerce.Application.Features.Reports.Queries.GetRevenueByCategory;
using Ecommerce.Application.Features.Reports.Queries.GetRevenueByMonth;
using Ecommerce.Application.Features.Reports.Queries.GetRevenueTrend;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;
using Ecommerce.Infrastructure.Persistence;
using Ecommerce.Infrastructure.Services;
using MediatR;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Options;
using Xunit;

namespace Ecommerce.WebAPI.IntegrationTests;

public sealed class RemediationPhase2CTests : IDisposable
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

    public void Dispose() => _factory.Dispose();

    // ─────────────────────────────────────────────────────────────
    // SEC-02: FileStorageService Path Traversal Prevention
    // ─────────────────────────────────────────────────────────────

    [Theory]
    [InlineData("../outside-secret.txt")]
    [InlineData("../../outside-secret.txt")]
    [InlineData("uploads/../../outside-secret.txt")]
    [InlineData("..\\outside-secret.txt")]
    public async Task SEC02_DeleteFileAsync_RejectsPathTraversalOutsideWebRoot(string traversalPath)
    {
        var sandbox = Path.Combine(Path.GetTempPath(), "phase2c-sec02-" + Guid.NewGuid().ToString("N"));
        var contentRoot = Path.Combine(sandbox, "content");
        var webRoot = Path.Combine(contentRoot, "wwwroot");
        Directory.CreateDirectory(webRoot);
        var outsideFile = Path.Combine(contentRoot, "outside-secret.txt");
        await File.WriteAllTextAsync(outsideFile, "survive");

        try
        {
            var service = new FileStorageService(
                new FakeEnv(contentRoot, webRoot),
                Options.Create(new FileStorageConfig { UploadFolder = "uploads", AppUrl = "https://localhost" }));

            var deleted = await service.DeleteFileAsync(traversalPath);

            Assert.False(deleted, $"DeleteFileAsync should have returned false for traversal path '{traversalPath}'.");
            Assert.True(File.Exists(outsideFile), "File outside webRoot was deleted by path traversal!");
        }
        finally
        {
            if (Directory.Exists(sandbox)) Directory.Delete(sandbox, recursive: true);
        }
    }

    [Fact]
    public async Task SEC02_DeleteFileAsync_ValidFileInWebRoot_IsDeletedSuccessfully()
    {
        var sandbox = Path.Combine(Path.GetTempPath(), "phase2c-sec02-" + Guid.NewGuid().ToString("N"));
        var contentRoot = Path.Combine(sandbox, "content");
        var webRoot = Path.Combine(contentRoot, "wwwroot");
        var uploadsDir = Path.Combine(webRoot, "uploads");
        Directory.CreateDirectory(uploadsDir);
        var targetFile = Path.Combine(uploadsDir, "legit-file.txt");
        await File.WriteAllTextAsync(targetFile, "delete-me");

        try
        {
            var service = new FileStorageService(
                new FakeEnv(contentRoot, webRoot),
                Options.Create(new FileStorageConfig { UploadFolder = "uploads", AppUrl = "https://localhost" }));

            var deleted = await service.DeleteFileAsync("uploads/legit-file.txt");

            Assert.True(deleted, "DeleteFileAsync should have returned true for valid file in webRoot.");
            Assert.False(File.Exists(targetFile), "File in webRoot should have been deleted.");
        }
        finally
        {
            if (Directory.Exists(sandbox)) Directory.Delete(sandbox, recursive: true);
        }
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public async Task SEC02_DeleteFileAsync_EmptyOrNullPath_ReturnsFalse(string? path)
    {
        var sandbox = Path.Combine(Path.GetTempPath(), "phase2c-sec02-" + Guid.NewGuid().ToString("N"));
        var contentRoot = Path.Combine(sandbox, "content");
        var webRoot = Path.Combine(contentRoot, "wwwroot");
        Directory.CreateDirectory(webRoot);

        try
        {
            var service = new FileStorageService(
                new FakeEnv(contentRoot, webRoot),
                Options.Create(new FileStorageConfig { UploadFolder = "uploads", AppUrl = "https://localhost" }));

            var deleted = await service.DeleteFileAsync(path!);
            Assert.False(deleted);
        }
        finally
        {
            if (Directory.Exists(sandbox)) Directory.Delete(sandbox, recursive: true);
        }
    }

    // ─────────────────────────────────────────────────────────────
    // SEC-03: Broken Access Control & Defense-in-Depth Authorization
    // ─────────────────────────────────────────────────────────────

    [Fact]
    public async Task SEC03_Anonymous_CannotDownloadProductImportTemplate()
    {
        using var client = NewClient();

        var response = await client.GetAsync("/api/products/export-template?format=csv");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task SEC03_Customer_CannotDownloadProductImportTemplate()
    {
        using var client = NewClient();
        await AttachTokenAsync(client, "customer@example.com", "Customer@123");

        var response = await client.GetAsync("/api/products/export-template?format=xlsx");

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task SEC03_Admin_CanDownloadProductImportTemplate()
    {
        using var client = NewClient();
        await AttachTokenAsync(client, "admin@Ecommerce.com", "Admin@123456");

        var response = await client.GetAsync("/api/products/export-template?format=xlsx");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var bytes = await response.Content.ReadAsByteArrayAsync();
        Assert.NotNull(bytes);
        Assert.NotEmpty(bytes);
    }

    [Fact]
    public async Task SEC03_Anonymous_CannotAccessUserActivities()
    {
        using var client = NewClient();

        var listResponse = await client.GetAsync("/api/UserActivities");
        var recentResponse = await client.GetAsync("/api/UserActivities/recent");

        Assert.Equal(HttpStatusCode.Unauthorized, listResponse.StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, recentResponse.StatusCode);
    }

    [Fact]
    public async Task SEC03_Customer_CanAccessOwnRecentActivities()
    {
        using var client = NewClient();
        await AttachTokenAsync(client, "customer@example.com", "Customer@123");

        var response = await client.GetAsync("/api/UserActivities/recent?count=5");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task SEC03_Customer_CannotAccessOtherUserActivities()
    {
        using var client = NewClient();
        await AttachTokenAsync(client, "customer@example.com", "Customer@123");

        var targetUserId = Guid.NewGuid();
        var response = await client.GetAsync($"/api/UserActivities/user/{targetUserId}");

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task SEC03_PublicCatalogBrowsing_RemainsAccessibleForAnonymous()
    {
        using var client = NewClient();

        var productsResponse = await client.GetAsync("/api/products/paged?pageNumber=1&pageSize=10");
        var categoriesResponse = await client.GetAsync("/api/Categories");

        Assert.Equal(HttpStatusCode.OK, productsResponse.StatusCode);
        Assert.Equal(HttpStatusCode.OK, categoriesResponse.StatusCode);
    }

    // ─────────────────────────────────────────────────────────────
    // REPORT: Date Boundary Correctness & SQL Aggregation
    // ─────────────────────────────────────────────────────────────

    [Fact]
    public async Task REPORT_RevenueByMonth_IncludesLastDayEndOfDayOrder()
    {
        using (var scope = _factory.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var admin = await db.Users.SingleAsync(u => u.Email == "admin@Ecommerce.com");
            var product = await db.Products.AsNoTracking().FirstAsync();

            var order = Order.Create(admin.Id, "Test Buyer", "buyer@example.com", "0909111222",
                "123 Test Street", null, null, null, $"ORD-{Guid.NewGuid():N}"[..20]);
            order.AddOrderItem(product.Id, product.Name, product.Image, 1500m, 2, null, null);
            db.Orders.Add(order);
            // Place order at 23:59:00 on the last day of March 2025
            db.Entry(order).Property(nameof(Order.OrderDate)).CurrentValue = new DateTime(2025, 3, 31, 23, 59, 0, DateTimeKind.Utc);
            db.Entry(order).Property(nameof(Order.Status)).CurrentValue = EOrderStatus.Completed;
            await db.SaveChangesAsync();
        }

        using var querying = _factory.CreateScope();
        var mediator = querying.ServiceProvider.GetRequiredService<IMediator>();
        var result = await mediator.Send(new GetRevenueByMonthQuery { Year = 2025, MonthsCount = 12 });

        Assert.True(result.IsSuccess, result.Error);
        var march = result.Value!.Single(m => m.Month == 3 && m.Year == 2025);
        Assert.True(march.Total >= 3000m, $"March 2025 revenue was {march.Total}, expected >= 3000m.");
    }

    [Fact]
    public async Task REPORT_RevenueByMonth_ExcludesNextMonthFirstDayOrder()
    {
        using (var scope = _factory.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var admin = await db.Users.SingleAsync(u => u.Email == "admin@Ecommerce.com");
            var product = await db.Products.AsNoTracking().FirstAsync();

            var order = Order.Create(admin.Id, "April Buyer", "april@example.com", "0909111333",
                "456 April Street", null, null, null, $"ORD-{Guid.NewGuid():N}"[..20]);
            order.AddOrderItem(product.Id, product.Name, product.Image, 2500m, 1, null, null);
            db.Orders.Add(order);
            // Place order at exactly 00:00:00 on April 1, 2025
            db.Entry(order).Property(nameof(Order.OrderDate)).CurrentValue = new DateTime(2025, 4, 1, 0, 0, 0, DateTimeKind.Utc);
            db.Entry(order).Property(nameof(Order.Status)).CurrentValue = EOrderStatus.Completed;
            await db.SaveChangesAsync();
        }

        using var querying = _factory.CreateScope();
        var mediator = querying.ServiceProvider.GetRequiredService<IMediator>();
        var result = await mediator.Send(new GetRevenueByMonthQuery { Year = 2025, MonthsCount = 12 });

        Assert.True(result.IsSuccess, result.Error);
        var april = result.Value!.Single(m => m.Month == 4 && m.Year == 2025);
        Assert.True(april.Total >= 2500m, $"April 2025 revenue was {april.Total}, expected >= 2500m.");
    }

    [Fact]
    public async Task REPORT_RevenueByCategory_ReturnsAggregatedDataSuccessfully()
    {
        using var scope = _factory.CreateScope();
        var mediator = scope.ServiceProvider.GetRequiredService<IMediator>();

        var result = await mediator.Send(new GetRevenueByCategoryQuery
        {
            StartDate = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            EndDate = new DateTime(2025, 12, 31, 23, 59, 59, DateTimeKind.Utc),
            TopN = 5
        });

        Assert.True(result.IsSuccess, result.Error);
        Assert.NotNull(result.Value);
        // Verify list is ordered descending by revenue
        for (int i = 0; i < result.Value.Count - 1; i++)
        {
            Assert.True(result.Value[i].Value >= result.Value[i + 1].Value, "Categories must be ordered descending by Value.");
        }
    }

    [Fact]
    public async Task REPORT_RevenueTrend_ReturnsWeeklyAggregatedData()
    {
        using var scope = _factory.CreateScope();
        var mediator = scope.ServiceProvider.GetRequiredService<IMediator>();

        var result = await mediator.Send(new GetRevenueTrendQuery
        {
            WeeksCount = 4
        });

        Assert.True(result.IsSuccess, result.Error);
        Assert.NotNull(result.Value);
        Assert.NotEmpty(result.Value);
    }

    // ─────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────

    private static async Task AttachTokenAsync(HttpClient client, string email, string password)
    {
        var loginResponse = await client.PostAsJsonAsync("/api/auth/login", new
        {
            Email = email,
            Password = password
        }, JsonOptions);

        Assert.Equal(HttpStatusCode.OK, loginResponse.StatusCode);
        var body = await loginResponse.Content.ReadFromJsonAsync<JsonObject>(JsonOptions);
        var accessToken = body?["data"]?["accessToken"]?.GetValue<string>();
        Assert.False(string.IsNullOrWhiteSpace(accessToken));
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
    }

    private sealed class FakeEnv(string contentRoot, string webRoot) : IWebHostEnvironment
    {
        public string ApplicationName { get; set; } = "Phase2CSandbox";
        public IFileProvider ContentRootFileProvider { get; set; } = new NullFileProvider();
        public string ContentRootPath { get; set; } = contentRoot;
        public string EnvironmentName { get; set; } = "Development";
        public string WebRootPath { get; set; } = webRoot;
        public IFileProvider WebRootFileProvider { get; set; } = new NullFileProvider();
    }
}

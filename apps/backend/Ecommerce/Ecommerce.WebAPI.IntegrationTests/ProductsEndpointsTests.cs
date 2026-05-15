using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json.Nodes;
using System.Text.Json;
using Ecommerce.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Ecommerce.WebAPI.IntegrationTests;

public sealed class ProductsEndpointsTests : IDisposable
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);
    private readonly CustomWebApplicationFactory _factory = new();
    private readonly HttpClient _client;

    public ProductsEndpointsTests()
    {
        _client = _factory.CreateClient(new Microsoft.AspNetCore.Mvc.Testing.WebApplicationFactoryClientOptions
        {
            BaseAddress = new Uri("https://localhost"),
            AllowAutoRedirect = false,
            HandleCookies = true
        });
    }

    [Fact]
    public async Task Login_WithValidCredentials_ReturnsOkAndAuthCookies()
    {
        var response = await LoginAsAdminAsync();

        await AssertStatusCodeAsync(HttpStatusCode.OK, response);
        Assert.Contains(response.Headers.GetValues("Set-Cookie"), cookie => cookie.StartsWith("access_token=", StringComparison.OrdinalIgnoreCase));
        Assert.Contains(response.Headers.GetValues("Set-Cookie"), cookie => cookie.StartsWith("refresh_token=", StringComparison.OrdinalIgnoreCase));
        Assert.Contains(response.Headers.GetValues("Set-Cookie"), cookie => cookie.StartsWith("csrf_token=", StringComparison.OrdinalIgnoreCase));
    }

    [Fact]
    public async Task CreateProduct_AsAdmin_ReturnsCreated()
    {
        await LoginAsAdminAndAttachCookieAsync();

        var productSeed = await GetExistingProductSeedAsync();
        using var content = BuildCreateProductContent(productSeed.CategoryId, productSeed.BrandId, productSeed.Code, productSeed.Sku);

        var response = await _client.PostAsync("/api/products", content);

        await AssertStatusCodeAsync(HttpStatusCode.Created, response);

        var productId = await response.Content.ReadFromJsonAsync<Guid>(JsonOptions);
        Assert.NotEqual(Guid.Empty, productId);
    }

    [Fact]
    public async Task GetProductById_ReturnsOkForExistingProduct()
    {
        await LoginAsAdminAsync();

        var productId = await GetExistingProductIdAsync();
        var response = await _client.GetAsync($"/api/products/{productId}");

        await AssertStatusCodeAsync(HttpStatusCode.OK, response);
    }

    [Fact]
    public async Task GetProductById_ReturnsNotFoundForMissingProduct()
    {
        await LoginAsAdminAsync();

        var response = await _client.GetAsync($"/api/products/{Guid.NewGuid()}");

        await AssertStatusCodeAsync(HttpStatusCode.NotFound, response);
    }

    public void Dispose()
    {
        _client.Dispose();
        _factory.Dispose();
    }

    private async Task<HttpResponseMessage> LoginAsAdminAsync()
    {
        return await _client.PostAsJsonAsync("/api/auth/login", new
        {
            Email = "admin@Ecommerce.com",
            Password = "Admin@123456"
        }, JsonOptions);
    }

    private async Task LoginAsAdminAndAttachCookieAsync()
    {
        var response = await LoginAsAdminAsync();
        await AssertStatusCodeAsync(HttpStatusCode.OK, response);

        var accessTokenCookie = response.Headers
            .GetValues("Set-Cookie")
            .Select(cookie => cookie.Split(';', 2)[0])
            .First(cookie => cookie.StartsWith("access_token=", StringComparison.OrdinalIgnoreCase));
        var body = await response.Content.ReadFromJsonAsync<JsonObject>(JsonOptions);
        var accessToken = body?["data"]?["accessToken"]?.GetValue<string>();

        Assert.False(string.IsNullOrWhiteSpace(accessToken));
        _client.DefaultRequestHeaders.Remove("Cookie");
        _client.DefaultRequestHeaders.Add("Cookie", accessTokenCookie);
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
    }

    private static async Task AssertStatusCodeAsync(HttpStatusCode expected, HttpResponseMessage response)
    {
        if (response.StatusCode != expected)
        {
            var body = await response.Content.ReadAsStringAsync();
            Assert.Fail($"Expected HTTP {(int)expected} {expected}, got {(int)response.StatusCode} {response.StatusCode}. Body: {body}");
        }
    }

    private async Task<(Guid CategoryId, Guid BrandId, string Code, string Sku)> GetExistingProductSeedAsync()
    {
        using var scope = _factory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        var seed = await db.Products
            .AsNoTracking()
            .Select(p => new { p.CategoryId, p.BrandId, p.Code, p.Sku })
            .FirstAsync();

        return (seed.CategoryId, seed.BrandId, seed.Code, seed.Sku);
    }

    private async Task<Guid> GetExistingProductIdAsync()
    {
        using var scope = _factory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        return await db.Products.AsNoTracking().Select(p => p.Id).FirstAsync();
    }

    private static MultipartFormDataContent BuildCreateProductContent(Guid categoryId, Guid brandId, string code, string sku)
    {
        var unique = Guid.NewGuid().ToString("N")[..8];
        var content = new MultipartFormDataContent
        {
            { new StringContent(code), "Code" },
            { new StringContent($"Integration Test Product {unique}"), "Name" },
            { new StringContent(sku), "Sku" },
            { new StringContent("100000"), "Price" },
            { new StringContent("90000"), "SalePrice" },
            { new StringContent("Integration test product description"), "Description" },
            { new StringContent("10"), "StockQuantity" },
            { new StringContent("true"), "IsActive" },
            { new StringContent(categoryId.ToString()), "CategoryId" },
            { new StringContent(brandId.ToString()), "BrandId" }
        };

        var image = new ByteArrayContent([0x89, 0x50, 0x4E, 0x47]);
        image.Headers.ContentType = new MediaTypeHeaderValue("image/png");
        content.Add(image, "MainImage", "product.png");

        return content;
    }
}

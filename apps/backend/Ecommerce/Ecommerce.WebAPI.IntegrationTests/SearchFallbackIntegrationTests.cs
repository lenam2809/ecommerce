using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Nodes;
using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Features.Products.Dto;
using Ecommerce.Domain.Entities;
using Ecommerce.Infrastructure.Elasticsearch;
using Ecommerce.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Logging.Abstractions;
using Xunit;

namespace Ecommerce.WebAPI.IntegrationTests;

public sealed class SearchFallbackIntegrationTests : IDisposable
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);
    private readonly CustomWebApplicationFactory _factory = new();

    public void Dispose() => _factory.Dispose();

    [Fact]
    public async Task SearchProductsAsync_WithKeyword_ReturnsMatchingProducts()
    {
        using var scope = _factory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var uow = scope.ServiceProvider.GetRequiredService<Domain.Interfaces.IUnitOfWork>();

        var seed = await db.Products.AsNoTracking().Select(p => new { p.CategoryId, p.BrandId }).FirstAsync();
        var uniqueTag = Guid.NewGuid().ToString("N")[..8];

        var prod1 = Product.Create(
            $"P-{uniqueTag}-1", $"Áo thun cotton {uniqueTag}", $"ao-thun-{uniqueTag}",
            $"SKU-{uniqueTag}-1", 150000m, 120000m, "img1.png", "Chất liệu cotton thoáng mát",
            10, seed.CategoryId, seed.BrandId);

        var prod2 = Product.Create(
            $"P-{uniqueTag}-2", $"Balo chống nước {uniqueTag}", $"balo-{uniqueTag}",
            $"SKU-{uniqueTag}-2", 350000m, null, "img2.png", "Vải dù cao cấp",
            5, seed.CategoryId, seed.BrandId);

        db.Products.AddRange(prod1, prod2);
        await db.SaveChangesAsync();

        var searchService = new NoOpProductSearchService(uow, NullLogger<NoOpProductSearchService>.Instance);

        // Act: Search for "Áo thun"
        var (items, totalCount) = await searchService.SearchProductsAsync(
            keyword: $"Áo thun {uniqueTag}",
            categoryId: null,
            brandId: null,
            minPrice: null,
            maxPrice: null,
            pageNumber: 1,
            pageSize: 10);

        // Assert
        Assert.True(totalCount >= 1);
        Assert.Contains(items, i => i.Id == prod1.Id);
        Assert.DoesNotContain(items, i => i.Id == prod2.Id);
    }

    [Fact]
    public async Task SearchProductsAsync_WithPriceRangeFilter_FiltersAccurately()
    {
        using var scope = _factory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var uow = scope.ServiceProvider.GetRequiredService<Domain.Interfaces.IUnitOfWork>();

        var seed = await db.Products.AsNoTracking().Select(p => new { p.CategoryId, p.BrandId }).FirstAsync();
        var uniqueTag = Guid.NewGuid().ToString("N")[..8];

        var cheapProd = Product.Create(
            $"P-{uniqueTag}-C", $"Ví nam nhỏ {uniqueTag}", $"vi-nam-{uniqueTag}",
            $"SKU-{uniqueTag}-C", 50000m, null, "imgC.png", "Ví da nhân tạo",
            20, seed.CategoryId, seed.BrandId);

        var expensiveProd = Product.Create(
            $"P-{uniqueTag}-E", $"Ví da cá sấu {uniqueTag}", $"vi-ca-sau-{uniqueTag}",
            $"SKU-{uniqueTag}-E", 800000m, null, "imgE.png", "Ví da thật cao cấp",
            5, seed.CategoryId, seed.BrandId);

        db.Products.AddRange(cheapProd, expensiveProd);
        await db.SaveChangesAsync();

        var searchService = new NoOpProductSearchService(uow, NullLogger<NoOpProductSearchService>.Instance);

        // Filter: minPrice = 300,000, maxPrice = 1,000,000
        var (items, totalCount) = await searchService.SearchProductsAsync(
            keyword: uniqueTag,
            categoryId: null,
            brandId: null,
            minPrice: 300000m,
            maxPrice: 1000000m,
            pageNumber: 1,
            pageSize: 10);

        Assert.Equal(1, totalCount);
        Assert.Equal(expensiveProd.Id, items[0].Id);
    }

    [Fact]
    public async Task GetSuggestionsAsync_ReturnsMatchingSuggestions()
    {
        using var scope = _factory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var uow = scope.ServiceProvider.GetRequiredService<Domain.Interfaces.IUnitOfWork>();

        var seed = await db.Products.AsNoTracking().Select(p => new { p.CategoryId, p.BrandId }).FirstAsync();
        var uniqueTag = Guid.NewGuid().ToString("N")[..8];

        var prod = Product.Create(
            $"P-{uniqueTag}-S", $"Tai nghe bluetooth {uniqueTag}", $"tai-nghe-{uniqueTag}",
            $"SKU-{uniqueTag}-S", 299000m, null, "headphone.png", "Tai nghe không dây",
            15, seed.CategoryId, seed.BrandId);

        db.Products.Add(prod);
        await db.SaveChangesAsync();

        var searchService = new NoOpProductSearchService(uow, NullLogger<NoOpProductSearchService>.Instance);

        var suggestions = await searchService.GetSuggestionsAsync($"Tai nghe bluetooth {uniqueTag}", limit: 5);

        Assert.NotEmpty(suggestions);
        Assert.Contains(suggestions, s => s.Id == prod.Id && s.Text == prod.Name);
    }

    [Fact]
    public async Task SearchApi_WhenElasticsearchDisabled_Returns200WithResults()
    {
        using var fallbackApp = _factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureServices(services =>
            {
                services.RemoveAll<IProductSearchService>();
                services.RemoveAll<IElasticsearchIndexService>();
                services.AddScoped<IProductSearchService, NoOpProductSearchService>();
                services.AddScoped<IElasticsearchIndexService>(sp => sp.GetRequiredService<IProductSearchService>());
            });
        });

        using var scope = fallbackApp.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var seed = await db.Products.AsNoTracking().Select(p => new { p.CategoryId, p.BrandId }).FirstAsync();
        var uniqueTag = Guid.NewGuid().ToString("N")[..8];

        var prod = Product.Create(
            $"P-{uniqueTag}-API", $"Giày chạy bộ {uniqueTag}", $"giay-chay-{uniqueTag}",
            $"SKU-{uniqueTag}-API", 500000m, 450000m, "shoes.png", "Giày êm ái thoáng khí",
            10, seed.CategoryId, seed.BrandId);

        db.Products.Add(prod);
        await db.SaveChangesAsync();

        using var client = fallbackApp.CreateClient();

        // Call the public API endpoint GET /api/search/products
        var response = await client.GetAsync($"/api/search/products?q={Uri.EscapeDataString(uniqueTag)}");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var json = await response.Content.ReadFromJsonAsync<JsonObject>(JsonOptions);
        Assert.NotNull(json);

        var isSuccess = json?["success"]?.GetValue<bool>() ?? json?["isSuccess"]?.GetValue<bool>() ?? false;
        Assert.True(isSuccess, "API search should succeed via database fallback.");

        var data = json?["data"];
        Assert.NotNull(data);

        var totalCount = data?["totalCount"]?.GetValue<int>() ?? 0;
        Assert.True(totalCount >= 1, "Expected at least 1 matching product in search results.");
    }
}

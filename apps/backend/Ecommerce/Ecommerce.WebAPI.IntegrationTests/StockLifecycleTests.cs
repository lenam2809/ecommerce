using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Ecommerce.WebAPI.IntegrationTests;

public sealed class StockLifecycleTests : IDisposable
{
    private readonly CustomWebApplicationFactory _factory = new();

    [Fact]
    public async Task ConcurrentSkuStockDecrement_AllowsOnlyOneSuccessAndDoesNotGoNegative()
    {
        var (productId, skuId) = await SeedVariantSkuAsync(stockQuantity: 1);

        var attempts = Enumerable.Range(0, 2)
            .Select(_ => Task.Run(async () =>
            {
                using var scope = _factory.CreateScope();
                var repository = scope.ServiceProvider.GetRequiredService<IProductVariantSkuRepository>();
                return await repository.TryDecrementStockAsync(skuId, productId, 1);
            }))
            .ToArray();

        var results = await Task.WhenAll(attempts);

        Assert.Equal(1, results.Count(success => success));

        using var verifyScope = _factory.CreateScope();
        var db = verifyScope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var remainingStock = await db.ProductVariantSkus
            .AsNoTracking()
            .Where(s => s.Id == skuId)
            .Select(s => s.StockQuantity)
            .SingleAsync();

        Assert.Equal(0, remainingStock);
    }

    public void Dispose()
    {
        _factory.Dispose();
    }

    private async Task<(Guid ProductId, Guid SkuId)> SeedVariantSkuAsync(int stockQuantity)
    {
        using var scope = _factory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var seed = await db.Products
            .AsNoTracking()
            .Select(p => new { p.CategoryId, p.BrandId })
            .FirstAsync();

        var product = Product.Create(
            $"P-{Guid.NewGuid():N}"[..20],
            "Variant stock test product",
            $"variant-stock-test-{Guid.NewGuid():N}"[..32],
            $"SKU-{Guid.NewGuid():N}"[..32],
            1000m,
            null,
            "products/test.png",
            "Variant stock test product",
            0,
            seed.CategoryId,
            seed.BrandId);
        product.Id = Guid.NewGuid();
        product.EnableVariants();

        var sku = ProductVariantSku.Create(product.Id, $"SKU-{Guid.NewGuid():N}", 1000m, null, stockQuantity);
        sku.Id = Guid.NewGuid();

        db.Products.Add(product);
        db.ProductVariantSkus.Add(sku);
        await db.SaveChangesAsync();

        return (product.Id, sku.Id);
    }
}

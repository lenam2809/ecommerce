using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Infrastructure.Persistence.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Infrastructure.Persistence.Repositories
{
    public class ProductRepository : BaseRepository<Product>, IProductRepository
    {
        public ProductRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Product>> GetBestsellingProductsAsync(CancellationToken cancellationToken = default)
        {
            return await _context.Products
            .Take(8)
            .ToListAsync(cancellationToken);
        }

        public async Task<IEnumerable<Product>> GetByCategoryIdAsync(Guid categoryId, CancellationToken cancellationToken = default)
        {
            return await _context.Products
                .Where(p => p.CategoryId == categoryId)
                .ToListAsync(cancellationToken);
        }

        public async Task<IEnumerable<Product>> GetByBrandIdAsync(Guid brandId, CancellationToken cancellationToken = default)
        {
            return await _context.Products
                .Where(p => p.BrandId == brandId)
                .ToListAsync(cancellationToken);
        }

        public async Task<Review?> GetProductReviewsAsync(Guid productId, CancellationToken cancellation = default)
        {
            return await _context.Reviews.FirstOrDefaultAsync(r => r.ProductId == productId, cancellation);
        }

        public Task<(IEnumerable<Product> Products, int Total, int TotalPages)> GetProductsAsync(string? category = null, string? brand = null, decimal? minPrice = null, decimal? maxPrice = null, int? rating = null, string? sort = null, int page = 1, int limit = 12, string? search = null, CancellationToken cancellation = default)
        {
            throw new NotImplementedException();
        }

        public async Task<IEnumerable<Product>> GetProductsByIdsAsync(List<Guid> productIds, CancellationToken cancellationToken = default)
        {
            return await _context.Products
                .Where(p => productIds.Contains(p.Id))
                .ToListAsync(cancellationToken);
        }

        public async Task<IEnumerable<Product>> GetSearchSuggestiosAsync(string query, int limit, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(query))
            {
                return await _context.Products
                .OrderByDescending(p => p.Rating)
                .Take(limit)
                .ToListAsync(cancellationToken);

            }
            return await _context.Products
                .Where(p => p.Name.Contains(query) || p.Category.Name.Contains(query) || p.Brand.Name.Contains(query))
                .OrderByDescending(p => p.Rating)
                .Take(limit)
                .ToListAsync(cancellationToken);
        }

        public async Task<IEnumerable<Product>> GetSimilarProductsAsync(Guid productId, CancellationToken cancellation = default)
        {
            var product = await _context.Products.FindAsync(productId);
            if (product == null)
                return Enumerable.Empty<Product>();

            return await _context.Products
                .Where(p => p.CategoryId == product.CategoryId && p.Id != productId)
                .OrderByDescending(p => p.Rating)
                .Take(5)
                .ToListAsync();
        }

        public async Task<bool> ExistsAsync(Guid id, CancellationToken cancellationToken = default)
        {
            return await _context.Products.AnyAsync(p => p.Id == id, cancellationToken);
        }

        public async Task<bool> IsCodeUniqueAsync(string code, Guid? id = null, CancellationToken cancellationToken = default)
        {
            return await _context.Products.AnyAsync(p => p.Code == code && (!id.HasValue || p.Id != id), cancellationToken);
        }

        public async Task<bool> IsSkuUniqueAsync(string sku, Guid? id = null, CancellationToken cancellationToken = default)
        {
            return await _context.Products
            .AnyAsync(p => p.Sku == sku && (!id.HasValue || p.Id != id), cancellationToken);
        }

        public async Task<IEnumerable<Product>> GetProductsByIdsAsync(IEnumerable<Guid> ids, CancellationToken cancellationToken = default)
        {
            return await _context.Products
                .Where(p => ids.Contains(p.Id))
                .ToListAsync(cancellationToken);
        }

        public async Task ClearColorAsync(Guid productId, CancellationToken cancellationToken = default)
        {
            await _context.ProductColors
                .Where(pc => pc.ProductVariant.ProductId == productId)
                .ExecuteDeleteAsync(cancellationToken);
        }

        public async Task ClearSizeAsync(Guid productId, CancellationToken cancellationToken = default)
        {
            await _context.ProductSizes
                .Where(pc => pc.ProductVariant.ProductId == productId)
                .ExecuteDeleteAsync(cancellationToken);
        }
    }
}


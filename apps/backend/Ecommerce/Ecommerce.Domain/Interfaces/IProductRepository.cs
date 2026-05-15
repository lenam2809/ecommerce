using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces.Base;

namespace Ecommerce.Domain.Interfaces
{
    public interface IProductRepository : IRepository<Product>
    {
        Task<IEnumerable<Product>> GetByCategoryIdAsync(Guid categoryId, CancellationToken cancellation = default);
        Task<IEnumerable<Product>> GetByBrandIdAsync(Guid brandId, CancellationToken cancellation = default);

        Task<IEnumerable<Product>> GetProductsByIdsAsync(List<Guid> productIds, CancellationToken cancellation = default);

        Task<(IEnumerable<Product> Products, int Total, int TotalPages)> GetProductsAsync(
            string? category = null,
            string? brand = null,
            decimal? minPrice = null,
            decimal? maxPrice = null,
            int? rating = null,
            string? sort = null,
            int page = 1,
            int limit = 12,
            string? search = null, CancellationToken cancellation = default);

        Task<IEnumerable<Product>> GetSimilarProductsAsync(Guid productId, CancellationToken cancellation = default);
        Task<Review?> GetProductReviewsAsync(Guid productId, CancellationToken cancellation = default);
        Task<IEnumerable<Product>> GetBestsellingProductsAsync(CancellationToken cancellation = default);

        Task<IEnumerable<Product>> GetSearchSuggestiosAsync(string query, int limit, CancellationToken cancellationToken = default);


        Task<bool> ExistsAsync(Guid id, CancellationToken cancellationToken = default);
        Task<bool> IsCodeUniqueAsync(string code, Guid? id = null, CancellationToken cancellationToken = default);
        Task<bool> IsSkuUniqueAsync(string sku, Guid? id = null, CancellationToken cancellationToken = default);

        Task ClearColorAsync(Guid productId, CancellationToken cancellationToken = default);
        Task ClearSizeAsync(Guid productId, CancellationToken cancellationToken = default);

        Task<IEnumerable<Product>> GetProductsByIdsAsync(IEnumerable<Guid> ids, CancellationToken cancellationToken = default);

        Task<bool> TryDecrementStockAsync(Guid productId, int quantity, CancellationToken cancellationToken = default);
        Task RestoreStockAsync(Guid productId, int quantity, CancellationToken cancellationToken = default);
    }
}


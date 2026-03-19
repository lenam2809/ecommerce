using Ecommerce.Application.Features.Products.Dto;

namespace Ecommerce.Application.Common.Interfaces
{
    /// <summary>
    /// Abstraction cho Product Search Engine (Elasticsearch).
    /// Tuân thủ DIP — Application Layer định nghĩa, Infrastructure Layer implement.
    /// </summary>
    public interface IProductSearchService
    {
        /// <summary>
        /// Full-text search với fuzzy matching, lọc đa tiêu chí, phân trang.
        /// </summary>
        Task<(List<ProductSearchResultDto> Items, long TotalCount)> SearchProductsAsync(
            string? keyword,
            Guid? categoryId,
            Guid? brandId,
            decimal? minPrice,
            decimal? maxPrice,
            int pageNumber,
            int pageSize,
            string? sortBy = null,
            bool isDescending = false,
            CancellationToken cancellationToken = default);

        /// <summary>
        /// Auto-suggestion sử dụng Completion Suggester — trả kết quả siêu nhanh khi user đang gõ.
        /// </summary>
        Task<List<ProductSuggestionDto>> GetSuggestionsAsync(
            string query,
            int limit = 5,
            CancellationToken cancellationToken = default);

        /// <summary>
        /// Index (thêm) một product document vào Elasticsearch.
        /// </summary>
        Task IndexProductAsync(ProductSearchResultDto product, CancellationToken cancellationToken = default);

        /// <summary>
        /// Cập nhật một product document trên Elasticsearch.
        /// </summary>
        Task UpdateProductAsync(ProductSearchResultDto product, CancellationToken cancellationToken = default);

        /// <summary>
        /// Xóa một product document khỏi Elasticsearch.
        /// </summary>
        Task DeleteProductAsync(Guid productId, CancellationToken cancellationToken = default);

        /// <summary>
        /// Bulk index hàng loạt products — dùng cho initial sync.
        /// </summary>
        Task BulkIndexAsync(IEnumerable<ProductSearchResultDto> products, CancellationToken cancellationToken = default);
    }
}

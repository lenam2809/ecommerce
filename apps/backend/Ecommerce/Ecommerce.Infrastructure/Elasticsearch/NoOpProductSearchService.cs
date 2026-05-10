using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Exceptions;
using Ecommerce.Application.Features.Products.Dto;

namespace Ecommerce.Infrastructure.Elasticsearch
{
    /// <summary>
    /// Dummy implementation of IProductSearchService to use when Elasticsearch is disabled.
    /// Returns empty results and does nothing on index operations.
    /// </summary>
    public class NoOpProductSearchService : IProductSearchService
    {
        public Task<(List<ProductSearchResultDto> Items, long TotalCount)> SearchProductsAsync(
            string? keyword,
            Guid? categoryId,
            Guid? brandId,
            decimal? minPrice,
            decimal? maxPrice,
            int pageNumber,
            int pageSize,
            string? sortBy = null,
            bool isDescending = false,
            CancellationToken cancellationToken = default)
        {
            throw new SearchServiceUnavailableException("Elasticsearch search is disabled.");
        }

        public Task<List<ProductSuggestionDto>> GetSuggestionsAsync(
            string query,
            int limit = 5,
            CancellationToken cancellationToken = default)
        {
            return Task.FromResult(new List<ProductSuggestionDto>());
        }

        public Task IndexProductAsync(ProductSearchResultDto product, CancellationToken cancellationToken = default)
        {
            return Task.CompletedTask;
        }

        public Task UpdateProductAsync(ProductSearchResultDto product, CancellationToken cancellationToken = default)
        {
            return Task.CompletedTask;
        }

        public Task DeleteProductAsync(Guid productId, CancellationToken cancellationToken = default)
        {
            return Task.CompletedTask;
        }

        public Task BulkIndexAsync(IEnumerable<ProductSearchResultDto> products, CancellationToken cancellationToken = default)
        {
            return Task.CompletedTask;
        }
    }
}

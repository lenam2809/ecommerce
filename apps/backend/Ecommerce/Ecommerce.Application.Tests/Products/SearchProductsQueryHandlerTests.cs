using Ecommerce.Application.Common.Exceptions;
using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Features.Products.Dto;
using Ecommerce.Application.Features.Products.Queries.SearchProducts;
using Microsoft.Extensions.Logging.Abstractions;
using Xunit;

namespace Ecommerce.Application.Tests.Products
{
    public class SearchProductsQueryHandlerTests
    {
        [Fact]
        public async Task Handle_UsesQueryAliasAndReturnsPaginatedResults()
        {
            var service = new CapturingProductSearchService
            {
                Items =
                [
                    new ProductSearchResultDto
                    {
                        Id = Guid.NewGuid(),
                        Name = "Dien thoai",
                        Slug = "dien-thoai",
                        MainImage = "phone.jpg",
                        Price = 100
                    }
                ],
                TotalCount = 23
            };

            var handler = new SearchProductsQueryHandler(
                service,
                NullLogger<SearchProductsQueryHandler>.Instance);

            var result = await handler.Handle(new SearchProductsQuery
            {
                Query = "dien thoai",
                Page = 2,
                PageSize = 10,
                SortBy = "relevance"
            }, CancellationToken.None);

            Assert.True(result.IsSuccess);
            Assert.Equal("dien thoai", service.Keyword);
            Assert.Equal(2, service.PageNumber);
            Assert.Equal(10, service.PageSize);
            Assert.Equal(23, result.Value.TotalCount);
            Assert.Equal(3, result.Value.TotalPages);
            Assert.Single(result.Value.Items);
        }

        [Fact]
        public async Task Handle_ReturnsServiceUnavailableWhenSearchBackendFails()
        {
            var handler = new SearchProductsQueryHandler(
                new UnavailableProductSearchService(),
                NullLogger<SearchProductsQueryHandler>.Instance);

            var result = await handler.Handle(new SearchProductsQuery
            {
                Keyword = "iphone"
            }, CancellationToken.None);

            Assert.False(result.IsSuccess);
            Assert.Equal(Application.Common.Models.ResultError.ServiceUnavailable, result.ErrorType);
        }

        private class CapturingProductSearchService : IProductSearchService
        {
            public string? Keyword { get; private set; }
            public int PageNumber { get; private set; }
            public int PageSize { get; private set; }
            public List<ProductSearchResultDto> Items { get; set; } = [];
            public long TotalCount { get; set; }

            public virtual Task<(List<ProductSearchResultDto> Items, long TotalCount)> SearchProductsAsync(
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
                Keyword = keyword;
                PageNumber = pageNumber;
                PageSize = pageSize;
                return Task.FromResult((Items, TotalCount));
            }

            public Task<List<ProductSuggestionDto>> GetSuggestionsAsync(string query, int limit = 5, CancellationToken cancellationToken = default) =>
                Task.FromResult(new List<ProductSuggestionDto>());

            public Task IndexProductAsync(ProductSearchResultDto product, CancellationToken cancellationToken = default) => Task.CompletedTask;
            public Task UpdateProductAsync(ProductSearchResultDto product, CancellationToken cancellationToken = default) => Task.CompletedTask;
            public Task DeleteProductAsync(Guid productId, CancellationToken cancellationToken = default) => Task.CompletedTask;
            public Task BulkIndexAsync(IEnumerable<ProductSearchResultDto> products, CancellationToken cancellationToken = default) => Task.CompletedTask;
        }

        private sealed class UnavailableProductSearchService : CapturingProductSearchService
        {
            public override Task<(List<ProductSearchResultDto> Items, long TotalCount)> SearchProductsAsync(
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
                throw new SearchServiceUnavailableException("Search unavailable.");
            }
        }
    }
}

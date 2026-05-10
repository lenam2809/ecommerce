using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Products.Dto;
using Ecommerce.Application.Common.Exceptions;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Ecommerce.Application.Features.Products.Queries.SearchProducts
{
    /// <summary>
    /// Handler cho UC-CAT-02: Tìm kiếm sản phẩm.
    /// Sử dụng Elasticsearch qua IProductSearchService:
    /// - MultiMatch query (Name^3, Description) + Fuzziness.Auto cho dung sai lỗi chính tả
    /// - Term filter cho CategoryId, BrandId
    /// - Range filter cho giá (MinPrice → MaxPrice)
    /// - Trả về PaginatedList chuẩn
    /// </summary>
    public class SearchProductsQueryHandler
        : IRequestHandler<SearchProductsQuery, Result<PaginatedList<ProductSearchResultDto>>>
    {
        private readonly IProductSearchService _searchService;
        private readonly ILogger<SearchProductsQueryHandler> _logger;

        public SearchProductsQueryHandler(
            IProductSearchService searchService,
            ILogger<SearchProductsQueryHandler> logger)
        {
            _searchService = searchService;
            _logger = logger;
        }

        public async Task<Result<PaginatedList<ProductSearchResultDto>>> Handle(
            SearchProductsQuery request,
            CancellationToken cancellationToken)
        {
            try
            {
                _logger.LogDebug(
                    "SearchProducts: keyword='{Keyword}', category={CategoryId}, brand={BrandId}, " +
                    "price=[{MinPrice}-{MaxPrice}], page={Page}, size={Size}",
                    request.Keyword, request.CategoryId, request.BrandId,
                    request.MinPrice, request.MaxPrice, request.PageNumber, request.PageSize);

                var keyword = string.IsNullOrWhiteSpace(request.Keyword) ? request.Query : request.Keyword;
                var pageNumber = request.Page ?? request.PageNumber;

                var (items, totalCount) = await _searchService.SearchProductsAsync(
                    keyword: keyword,
                    categoryId: request.CategoryId,
                    brandId: request.BrandId,
                    minPrice: request.MinPrice,
                    maxPrice: request.MaxPrice,
                    pageNumber: pageNumber,
                    pageSize: request.PageSize,
                    sortBy: request.SortBy,
                    isDescending: request.IsDescending,
                    cancellationToken: cancellationToken);

                var result = new PaginatedList<ProductSearchResultDto>(
                    items,
                    (int)totalCount,
                    pageNumber,
                    request.PageSize);

                return Result<PaginatedList<ProductSearchResultDto>>.Success(result);
            }
            catch (SearchServiceUnavailableException ex)
            {
                _logger.LogWarning(ex, "Elasticsearch unavailable while searching products.");
                return Result<PaginatedList<ProductSearchResultDto>>.ServiceUnavailable(
                    "Search is temporarily unavailable. Please try again shortly.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tìm kiếm sản phẩm với keyword: {Keyword}", request.Keyword);
                return Result<PaginatedList<ProductSearchResultDto>>.ServerError(
                    "Đã xảy ra lỗi khi tìm kiếm sản phẩm. Vui lòng thử lại.");
            }
        }
    }
}

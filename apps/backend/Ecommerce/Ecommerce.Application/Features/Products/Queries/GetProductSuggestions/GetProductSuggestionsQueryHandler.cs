using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Products.Dto;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Ecommerce.Application.Features.Products.Queries.GetProductSuggestions
{
    /// <summary>
    /// Handler cho UC-CAT-06: Gợi ý tìm kiếm.
    /// Sử dụng Elasticsearch Completion Suggester:
    /// - In-memory FST (Finite State Transducer) — trả kết quả trong < 5ms
    /// - Hỗ trợ fuzzy matching (typo tolerance) khi gợi ý
    /// - Ưu tiên sản phẩm có rating cao (weight)
    /// </summary>
    public class GetProductSuggestionsQueryHandler
        : IRequestHandler<GetProductSuggestionsQuery, Result<List<ProductSuggestionDto>>>
    {
        private readonly IProductSearchService _searchService;
        private readonly ILogger<GetProductSuggestionsQueryHandler> _logger;

        public GetProductSuggestionsQueryHandler(
            IProductSearchService searchService,
            ILogger<GetProductSuggestionsQueryHandler> logger)
        {
            _searchService = searchService;
            _logger = logger;
        }

        public async Task<Result<List<ProductSuggestionDto>>> Handle(
            GetProductSuggestionsQuery request,
            CancellationToken cancellationToken)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.Query))
                {
                    return Result<List<ProductSuggestionDto>>.Success(new List<ProductSuggestionDto>());
                }

                var suggestions = await _searchService.GetSuggestionsAsync(
                    query: request.Query,
                    limit: request.Limit,
                    cancellationToken: cancellationToken);

                return Result<List<ProductSuggestionDto>>.Success(suggestions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy gợi ý tìm kiếm cho: {Query}", request.Query);
                return Result<List<ProductSuggestionDto>>.Success(new List<ProductSuggestionDto>());
            }
        }
    }
}

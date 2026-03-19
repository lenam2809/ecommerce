using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Products.Dto;
using MediatR;

namespace Ecommerce.Application.Features.Products.Queries.GetProductSuggestions
{
    /// <summary>
    /// UC-CAT-06: Gợi ý tìm kiếm (Auto-suggestion) khi user đang gõ.
    /// Sử dụng Elasticsearch Completion Suggester cho kết quả siêu nhanh.
    /// </summary>
    public class GetProductSuggestionsQuery : IRequest<Result<List<ProductSuggestionDto>>>
    {
        /// <summary>Chuỗi user đang gõ</summary>
        public string Query { get; set; } = string.Empty;

        /// <summary>Số gợi ý tối đa (mặc định 5)</summary>
        public int Limit { get; set; } = 5;
    }
}

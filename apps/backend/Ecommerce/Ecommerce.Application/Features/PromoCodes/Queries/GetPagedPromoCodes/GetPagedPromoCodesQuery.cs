using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.PromoCodes.Dto;
using MediatR;

using Ecommerce.Application.Common.Interfaces;

namespace Ecommerce.Application.Features.PromoCodes.Queries.GetPagedPromoCodes
{
    public class GetPagedPromoCodesQuery : IQuery<Result<PaginatedList<PromoCodeSummaryDto>>>
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string SearchTerm { get; set; } = string.Empty;
        public bool? IsActive { get; set; }
        public string SortBy { get; set; } = "code";
        public bool IsDescending { get; set; } = false;
    }
}


using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Marquee.DTOs;
using MediatR;

namespace Ecommerce.Application.Features.Marquee.Queries.GetPagedMarqueeAdmin
{
    public class GetPagedMarqueeAdminQuery : IRequest<Result<PaginatedList<MarqueeMessageAdminDto>>>
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string SearchTerm { get; set; } = string.Empty;
        public string SortBy { get; set; } = "priority";
        public bool IsDescending { get; set; } = false;
        public bool? IsActive { get; set; }
    }
}

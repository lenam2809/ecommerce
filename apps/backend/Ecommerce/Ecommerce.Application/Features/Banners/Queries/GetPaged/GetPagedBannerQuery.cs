using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Banners.Dto;
using MediatR;

namespace Ecommerce.Application.Features.Banners.Queries.GetPaged
{
    public class GetPagedBannerQuery : IRequest<Result<PaginatedList<BannerDto>>>
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string SearchTerm { get; set; } = string.Empty;
        public string SortBy { get; set; } = "title";
        public bool IsDescending { get; set; } = false;
    }
}
using Ecommerce.Application.Common.Attributes;
using Ecommerce.Application.Common.Constants;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Brands.Dto;
using Ecommerce.Domain.Enums;
using MediatR;

namespace Ecommerce.Application.Features.Brands.Queries.GetCategories
{
    [Cacheable(CacheKeys.BrandAll, ECachePolicy.Short)]
    public class GetBrandsQuery : IRequest<Result<PaginatedList<BrandDto>>>
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string SearchTerm { get; set; } = string.Empty;
        public string SortBy { get; set; } = "name";
        public bool IsDescending { get; set; } = false;
    }
}


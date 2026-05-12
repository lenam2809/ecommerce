using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Common.Attributes;
using Ecommerce.Application.Common.Constants;
using Ecommerce.Application.Features.Brands.Dto;
using MediatR;

namespace Ecommerce.Application.Features.Brands.Queries.GetAllBrands
{
    [Cacheable(CacheKeys.BrandAll)]
    public class GetAllBrandsQuery : IRequest<Result<List<BrandDto>>>
    {
    }
}


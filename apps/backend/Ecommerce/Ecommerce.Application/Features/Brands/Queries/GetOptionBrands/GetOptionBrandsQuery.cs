using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Common.Attributes;
using Ecommerce.Application.Common.Constants;
using MediatR;

namespace Ecommerce.Application.Features.Brands.Queries.GetOptionBrands
{
    [Cacheable(CacheKeys.BrandAll)]
    public class GetOptionBrandsQuery : IRequest<Result<List<Option>>>
    {
    }
}


using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Common.Attributes;
using Ecommerce.Application.Common.Constants;
using MediatR;

namespace Ecommerce.Application.Features.Brands.Queries.GetOptionProducts
{
    [Cacheable(CacheKeys.ProductAll)]
    public class GetOptionProductsQuery : IRequest<Result<List<Option>>>
    {
    }
}


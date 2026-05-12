using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Common.Attributes;
using Ecommerce.Application.Common.Constants;
using Ecommerce.Application.Features.Products.Dto;
using MediatR;

namespace Ecommerce.Application.Features.Products.Queries.GetProductsByCategory
{

    [Cacheable(CacheKeys.ProductAll)]
    public class GetProductsByCategoryQuery : IRequest<Result<List<ProductDto>>>
    {
        public Guid CategoryId { get; set; }
    }
}


using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Common.Attributes;
using Ecommerce.Application.Common.Constants;
using Ecommerce.Application.Features.Products.Dto;
using MediatR;

namespace Ecommerce.Application.Features.Products.Queries.GetProductsByBrand
{
    [Cacheable(CacheKeys.ProductAll)]
    public class GetProductsByBrandQuery : IRequest<Result<List<ProductDto>>>
    {
        public Guid BrandId { get; set; }
    }
}


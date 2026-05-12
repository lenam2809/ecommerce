using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Common.Attributes;
using Ecommerce.Application.Common.Constants;
using Ecommerce.Application.Features.Products.Dto;
using MediatR;

namespace Ecommerce.Application.Features.Products.Queries.GetProductBySlug
{
    [Cacheable(CacheKeys.ProductDetail)]
    public class GetProductBySlugQuery : IRequest<Result<ProductDto>>
    {
        public required string Slug { get; set; }
    }
}


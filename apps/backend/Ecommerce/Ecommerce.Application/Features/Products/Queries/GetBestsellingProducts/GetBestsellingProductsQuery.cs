using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Common.Attributes;
using Ecommerce.Application.Common.Constants;
using Ecommerce.Application.Features.Products.Dto;
using MediatR;

namespace Ecommerce.Application.Features.Products.Queries.GetBestsellingProducts
{
    [Cacheable(CacheKeys.ProductAll)]
    public record GetBestsellingProductsQuery : IRequest<Result<List<ProductDto>>>;
}


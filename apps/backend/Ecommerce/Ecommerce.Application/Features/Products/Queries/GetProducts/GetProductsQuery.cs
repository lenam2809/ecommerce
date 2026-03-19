using Ecommerce.Application.Common.Attributes;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Products.Dto;
using Ecommerce.Domain.Enums;
using MediatR;

namespace Ecommerce.Application.Features.Products.Queries.GetProducts
{
    [Cacheable("Products_All", ECachePolicy.Long)]
    public class GetProductsQuery : IRequest<Result<List<ProductDto>>>
    {
    }
}


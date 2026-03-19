using Ecommerce.Application.Common.Attributes;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Products.Dto;
using Ecommerce.Domain.Enums;
using MediatR;

namespace Ecommerce.Application.Features.Products.Queries.GetProductById
{
    [Cacheable("Product_Detail", ECachePolicy.Short)]
    public class GetProductByIdQuery : IRequest<Result<ProductDto>>
    {
        public Guid Id { get; set; }
    }
}


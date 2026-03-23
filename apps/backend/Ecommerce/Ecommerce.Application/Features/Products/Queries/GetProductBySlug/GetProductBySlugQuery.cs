using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Products.Dto;
using MediatR;

namespace Ecommerce.Application.Features.Products.Queries.GetProductBySlug
{
    public class GetProductBySlugQuery : IRequest<Result<ProductDto>>
    {
        public required string Slug { get; set; }
    }
}


using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Products.Dto;
using MediatR;

namespace Ecommerce.Application.Features.Products.Queries.GetSimilarProducts
{
    public record GetSimilarProductsQuery(Guid ProductId) : IRequest<Result<List<ProductDto>>>;

}


using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Products.Dto;
using MediatR;

namespace Ecommerce.Application.Features.Products.Queries.GetBestsellingProducts
{
    public record GetBestsellingProductsQuery : IRequest<Result<List<ProductDto>>>;
}


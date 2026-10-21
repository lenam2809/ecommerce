using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Products.Dto;
using MediatR;

namespace Ecommerce.Application.Features.Products.Queries.CompareProducts
{
    public class CompareProductsQuery : IRequest<Result<ProductComparisonDto>>
    {
        public string? Ids { get; set; }
        public List<Guid>? ProductIds { get; set; }
    }
}

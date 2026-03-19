using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Products.Dto;
using MediatR;

namespace Ecommerce.Application.Features.Products.Queries.GetProductsByCategory
{

    public class GetProductsByCategoryQuery : IRequest<Result<List<ProductDto>>>
    {
        public Guid CategoryId { get; set; }
    }
}


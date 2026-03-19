using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Products.Dto;
using MediatR;

namespace Ecommerce.Application.Features.Products.Queries.GetProductsByBrand
{
    public class GetProductsByBrandQuery : IRequest<Result<List<ProductDto>>>
    {
        public Guid BrandId { get; set; }
    }
}


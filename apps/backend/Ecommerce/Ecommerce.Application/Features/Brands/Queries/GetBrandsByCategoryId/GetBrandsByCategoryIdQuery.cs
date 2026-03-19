using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Brands.Dto;
using MediatR;

namespace Ecommerce.Application.Features.Brands.Queries.GetBrandsByCategoryId
{
    public class GetBrandsByCategoryIdQuery : IRequest<Result<List<BrandDto>>>
    {
        public Guid CategoryId { get; set; }
    }
}


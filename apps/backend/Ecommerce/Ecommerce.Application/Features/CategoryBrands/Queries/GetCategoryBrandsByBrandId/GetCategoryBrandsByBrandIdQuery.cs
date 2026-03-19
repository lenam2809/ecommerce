using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.CategoryBrands.Dto;
using MediatR;

namespace Ecommerce.Application.Features.CategoryBrands.Queries.GetCategoryBrandsByBrandId
{
    public class GetCategoryBrandsByBrandIdQuery : IRequest<Result<List<CategoryBrandDto>>>
    {
        public Guid BrandId { get; set; }
    }
}


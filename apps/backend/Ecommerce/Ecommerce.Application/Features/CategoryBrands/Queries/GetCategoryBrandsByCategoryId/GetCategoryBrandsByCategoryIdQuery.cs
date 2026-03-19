using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.CategoryBrands.Dto;
using MediatR;

namespace Ecommerce.Application.Features.CategoryBrands.Queries.GetCategoryBrandsByCategoryId
{
    public class GetCategoryBrandsByCategoryIdQuery : IRequest<Result<List<CategoryBrandDto>>>
    {
        public Guid CategoryId { get; set; }
    }
}


using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.CategoryBrands.Dto;
using MediatR;

namespace Ecommerce.Application.Features.CategoryBrands.Queries.GetAllCategoryBrands
{
    public class GetAllCategoryBrandsQuery : IRequest<Result<List<CategoryBrandDto>>>
    {
    }
}


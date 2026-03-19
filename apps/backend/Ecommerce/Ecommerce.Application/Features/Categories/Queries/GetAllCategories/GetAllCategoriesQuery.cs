using Ecommerce.Application.Common.Attributes;
using Ecommerce.Application.Common.Constants;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Categories.Dto;
using Ecommerce.Domain.Enums;
using MediatR;

namespace Ecommerce.Application.Features.Categories.Queries.GetAllCategories
{
    [Cacheable(CacheKeys.CategoryAll, ECachePolicy.Long)]
    public class GetAllCategoriesQuery : IRequest<Result<List<CategoryDto>>>
    {
    }
}


using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Common.Attributes;
using Ecommerce.Application.Common.Constants;
using Ecommerce.Application.Features.Categories.Dto;
using MediatR;

namespace Ecommerce.Application.Features.Categories.Queries.GetTopPopularCategories
{
    [Cacheable(CacheKeys.CategoryAll)]
    public class GetTopPopularCategoriesQuery : IRequest<Result<List<CategoryDto>>>
    {
        public int Limit { get; set; } = 3; // Mặc định lấy top 3
    }
}


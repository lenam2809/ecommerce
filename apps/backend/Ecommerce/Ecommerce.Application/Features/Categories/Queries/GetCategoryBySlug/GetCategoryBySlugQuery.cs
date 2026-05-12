using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Common.Attributes;
using Ecommerce.Application.Common.Constants;
using Ecommerce.Application.Features.Categories.Dto;
using MediatR;

namespace Ecommerce.Application.Features.Categories.Queries.GetCategoryBySlug
{
    [Cacheable(CacheKeys.CategoryDetail)]
    public class GetCategoryBySlugQuery : IRequest<Result<CategoryDto>>
    {
        public string Slug { get; set; } = string.Empty;
        public bool IncludeChildren { get; set; } = false;
        public bool IncludeBrands { get; set; } = false;
    }
}


using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Common.Attributes;
using Ecommerce.Application.Common.Constants;
using Ecommerce.Application.Features.Categories.Dto;
using MediatR;

namespace Ecommerce.Application.Features.Categories.Queries.GetCategoriesByBrandId
{
    [Cacheable(CacheKeys.CategoryAll)]
    public class GetCategoriesByBrandIdQuery : IRequest<Result<List<CategoryDto>>>
    {
        public Guid BrandId { get; set; }
    }
}


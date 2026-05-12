using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Common.Attributes;
using Ecommerce.Application.Common.Constants;
using MediatR;

namespace Ecommerce.Application.Features.Categories.Queries.GetOptionCategories
{
    [Cacheable(CacheKeys.CategoryAll)]
    public class GetOptionCategoriesQuery : IRequest<Result<List<object>>>
    {
        public bool IncludeChildren { get; set; } = false;
    }
}


using Ecommerce.Application.Common.Models;
using MediatR;

namespace Ecommerce.Application.Features.Categories.Queries.GetOptionCategories
{
    public class GetOptionCategoriesQuery : IRequest<Result<List<object>>>
    {
        public bool IncludeChildren { get; set; } = false;
    }
}


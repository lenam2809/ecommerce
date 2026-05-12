using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Common.Attributes;
using Ecommerce.Application.Common.Constants;
using Ecommerce.Application.Features.Categories.Dto;
using MediatR;

namespace Ecommerce.Application.Features.Categories.Queries.GetCategoryById
{
    [Cacheable(CacheKeys.CategoryDetail)]
    public class GetCategoryByIdQuery : IRequest<Result<CategoryDto>>
    {
        public Guid Id { get; set; }
    }
}


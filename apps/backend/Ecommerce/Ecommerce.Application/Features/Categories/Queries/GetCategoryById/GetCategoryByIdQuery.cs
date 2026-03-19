using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Categories.Dto;
using MediatR;

namespace Ecommerce.Application.Features.Categories.Queries.GetCategoryById
{
    public class GetCategoryByIdQuery : IRequest<Result<CategoryDto>>
    {
        public Guid Id { get; set; }
    }
}


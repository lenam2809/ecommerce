using Ecommerce.Application.Common.Models;
using MediatR;

namespace Ecommerce.Application.Features.Categories.Commands.DeleteCategory
{
    public class DeleteCategoryCommand : IRequest<Result<bool>>
    {
        public Guid Id { get; set; }
    }
}


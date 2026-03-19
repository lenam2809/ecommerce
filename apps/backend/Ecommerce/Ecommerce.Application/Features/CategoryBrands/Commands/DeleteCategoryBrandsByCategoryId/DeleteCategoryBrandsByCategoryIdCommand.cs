using Ecommerce.Application.Common.Models;
using MediatR;

namespace Ecommerce.Application.Features.CategoryBrands.Commands.DeleteCategoryBrandsByCategoryId
{
    public class DeleteCategoryBrandsByCategoryIdCommand : IRequest<Result<bool>>
    {
        public Guid CategoryId { get; set; }
    }
}


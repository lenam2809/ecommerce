using Ecommerce.Application.Common.Models;
using MediatR;

namespace Ecommerce.Application.Features.CategoryBrands.Commands.DeleteCategoryBrandsByBrandId
{
    public class DeleteCategoryBrandsByBrandIdCommand : IRequest<Result<bool>>
    {
        public Guid BrandId { get; set; }
    }
}


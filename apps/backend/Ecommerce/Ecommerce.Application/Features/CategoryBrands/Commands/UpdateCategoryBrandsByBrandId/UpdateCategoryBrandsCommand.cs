using Ecommerce.Application.Common.Models;
using MediatR;

namespace Ecommerce.Application.Features.CategoryBrands.Commands.UpdateCategoryBrandsByBrandId
{
    public class UpdateCategoryBrandsByBrandIdCommand : IRequest<Result<bool>>
    {
        public Guid BrandId { get; set; }
        public List<Guid> CategoryIds { get; set; } = [];
    }
}


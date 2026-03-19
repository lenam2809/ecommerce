using Ecommerce.Application.Common.Models;
using MediatR;

namespace Ecommerce.Application.Features.CategoryBrands.Commands.UpdateCategoryBrands
{
    public class UpdateCategoryBrandsByCategoryIdCommand : IRequest<Result<bool>>
    {
        public Guid CategoryId { get; set; }
        public List<Guid> BrandIds { get; set; } = [];
    }
}


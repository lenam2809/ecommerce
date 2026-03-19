using Ecommerce.Application.Common.Models;
using MediatR;

namespace Ecommerce.Application.Features.CategoryBrands.Commands.DeleteCategoryBrand
{
    public class DeleteCategoryBrandCommand : IRequest<Result<bool>>
    {
        public Guid CategoryId { get; set; }
        public Guid BrandId { get; set; }
    }
}


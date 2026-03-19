using Ecommerce.Application.Common.Models;
using MediatR;

namespace Ecommerce.Application.Features.CategoryBrands.Commands.CreateCategoryBrand
{
    public class CreateCategoryBrandCommand : IRequest<Result<bool>>
    {
        public Guid CategoryId { get; set; }
        public Guid BrandId { get; set; }
    }
}


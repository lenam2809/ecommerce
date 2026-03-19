using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Categories.Dto;
using MediatR;

namespace Ecommerce.Application.Features.Categories.Queries.GetCategoriesByBrandId
{
    public class GetCategoriesByBrandIdQuery : IRequest<Result<List<CategoryDto>>>
    {
        public Guid BrandId { get; set; }
    }
}


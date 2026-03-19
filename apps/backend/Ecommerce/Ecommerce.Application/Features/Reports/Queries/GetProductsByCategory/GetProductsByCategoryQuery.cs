using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Reports.Dto;
using MediatR;

namespace Ecommerce.Application.Features.Reports.Queries.GetProductsByCategory
{
    public class GetProductsByCategoryQuery : IRequest<Result<List<ProductsByCategoryDto>>>
    {
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public bool? IncludeInactive { get; set; } = false;
    }
}


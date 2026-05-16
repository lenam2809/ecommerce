using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Reports.Dto;
using MediatR;

using Ecommerce.Application.Common.Interfaces;

namespace Ecommerce.Application.Features.Reports.Queries.GetProductsByCategory
{
    public class GetProductsByCategoryQuery : IQuery<Result<List<ProductsByCategoryDto>>>
    {
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public bool? IncludeInactive { get; set; } = false;
    }
}


using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Reports.Dto;
using MediatR;

namespace Ecommerce.Application.Features.Reports.Queries.GetProductPerformance
{
    public class GetProductPerformanceQuery : IRequest<Result<List<ProductPerformanceDto>>>
    {
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public Guid? ProductId { get; set; }
        public Guid? CategoryId { get; set; }
        public int? TopN { get; set; } = 20;
    }
}


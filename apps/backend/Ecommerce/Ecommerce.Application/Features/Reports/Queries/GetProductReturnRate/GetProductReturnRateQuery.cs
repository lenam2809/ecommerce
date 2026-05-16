using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Reports.Dto;
using MediatR;

using Ecommerce.Application.Common.Interfaces;

namespace Ecommerce.Application.Features.Reports.Queries.GetProductReturnRate
{
    public class GetProductReturnRateQuery : IQuery<Result<List<ProductReturnRateDto>>>
    {
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public int? TopN { get; set; } = 10;
        public Guid? CategoryId { get; set; }
        public decimal? MinReturnRate { get; set; }
    }
}


using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Reports.Dto;
using MediatR;

namespace Ecommerce.Application.Features.Reports.Queries.GetOrderRatio
{
    public class GetOrderRatioQuery : IRequest<Result<List<OrderRatioDto>>>
    {
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public int? MonthsCount { get; set; } = 12;
    }
}


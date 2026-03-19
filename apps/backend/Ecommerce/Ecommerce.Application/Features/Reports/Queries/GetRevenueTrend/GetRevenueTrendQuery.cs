using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Reports.Dto;
using MediatR;

namespace Ecommerce.Application.Features.Reports.Queries.GetRevenueTrend
{
    public class GetRevenueTrendQuery : IRequest<Result<List<RevenueTrendDto>>>
    {
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public int? WeeksCount { get; set; } = 12; // Số tuần muốn lấy
    }
}


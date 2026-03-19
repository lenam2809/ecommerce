using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Reports.Dto;
using MediatR;

namespace Ecommerce.Application.Features.Reports.Queries.GetRevenueComparison
{
    public class GetRevenueComparisonQuery : IRequest<Result<List<RevenueComparisonDto>>>
    {
        public int? CurrentYear { get; set; }
        public int? PreviousYear { get; set; }
        public int? MonthsCount { get; set; } = 6; // Số tháng muốn so sánh
    }
}


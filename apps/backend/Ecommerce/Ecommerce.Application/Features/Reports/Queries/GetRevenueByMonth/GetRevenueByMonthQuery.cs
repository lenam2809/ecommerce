using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Reports.Dto;
using MediatR;

namespace Ecommerce.Application.Features.Reports.Queries.GetRevenueByMonth
{
    public class GetRevenueByMonthQuery : IRequest<Result<List<RevenueByMonthDto>>>
    {
        public int? Year { get; set; }
        public int? MonthsCount { get; set; } = 12; // Số tháng muốn lấy
    }
}


using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Reports.Dto;
using MediatR;

using Ecommerce.Application.Common.Interfaces;

namespace Ecommerce.Application.Features.Reports.Queries.GetRevenueByMonth
{
    public class GetRevenueByMonthQuery : IQuery<Result<List<RevenueByMonthDto>>>
    {
        public int? Year { get; set; }
        public int? MonthsCount { get; set; } = 12; // Số tháng muốn lấy
    }
}


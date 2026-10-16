using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Reports.Dto;
using Ecommerce.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Application.Features.Reports.Queries.GetRevenueByMonth
{
    public class GetRevenueByMonthQueryHandler : IRequestHandler<GetRevenueByMonthQuery, Result<List<RevenueByMonthDto>>>
    {
        private readonly IUnitOfWork _unitOfWork;

        public GetRevenueByMonthQueryHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<List<RevenueByMonthDto>>> Handle(GetRevenueByMonthQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var year = request.Year ?? DateTime.UtcNow.Year;
                var monthsCount = request.MonthsCount ?? 12;

                // Tạo danh sách các tháng cần lấy
                var monthsList = new List<(int Month, int Year)>();
                var currentDate = new DateTime(year, 12, 1, 0, 0, 0, DateTimeKind.Utc); // Bắt đầu từ tháng 12

                for (int i = 0; i < monthsCount; i++)
                {
                    monthsList.Add((currentDate.Month, currentDate.Year));
                    currentDate = currentDate.AddMonths(-1);
                }

                monthsList.Reverse(); // Đảo ngược để có thứ tự tăng dần

                // Truy vấn doanh thu theo tháng
                var results = new List<RevenueByMonthDto>();

                foreach (var (month, yearItem) in monthsList)
                {
                    var startDate = new DateTime(yearItem, month, 1, 0, 0, 0, DateTimeKind.Utc);
                    var nextMonthDate = startDate.AddMonths(1);

                    var itemTotals = await _unitOfWork.Orders.GetQueryable()
                        .Where(o => o.OrderDate >= startDate && o.OrderDate < nextMonthDate
                               && o.Status == Domain.Enums.EOrderStatus.Completed)
                        .SelectMany(o => o.OrderItems)
                        .Select(oi => oi.Quantity * oi.UnitPrice)
                        .ToListAsync(cancellationToken);

                    var monthlyRevenue = itemTotals.Sum();

                    results.Add(new RevenueByMonthDto
                    {
                        Name = $"Tháng {month}",
                        Total = monthlyRevenue,
                        Month = month,
                        Year = yearItem
                    });
                }

                return Result<List<RevenueByMonthDto>>.Success(results);
            }
            catch (Exception ex)
            {
                return Result<List<RevenueByMonthDto>>.BadRequest($"Lỗi khi lấy báo cáo doanh thu theo tháng: {ex.Message}");
            }
        }
    }
}


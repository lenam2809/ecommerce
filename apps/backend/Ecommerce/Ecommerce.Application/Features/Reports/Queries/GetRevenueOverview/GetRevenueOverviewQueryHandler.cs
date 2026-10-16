using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Reports.Dto;
using Ecommerce.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Application.Features.Reports.Queries.GetRevenueOverview
{
    public class GetRevenueOverviewQueryHandler : IRequestHandler<GetRevenueOverviewQuery, Result<RevenueOverviewDto>>
    {
        private readonly IUnitOfWork _unitOfWork;

        public GetRevenueOverviewQueryHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<RevenueOverviewDto>> Handle(GetRevenueOverviewQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var endDate = request.EndDate ?? DateTime.UtcNow;
                var startDate = request.StartDate ?? endDate.AddMonths(-12);

                var now = DateTime.UtcNow;
                var todayStart = new DateTime(now.Year, now.Month, now.Day, 0, 0, 0, DateTimeKind.Utc);
                var weekStart = todayStart.AddDays(-(int)todayStart.DayOfWeek);
                var monthStart = new DateTime(todayStart.Year, todayStart.Month, 1, 0, 0, 0, DateTimeKind.Utc);

                var orders = await _unitOfWork.Orders.GetQueryable()
                    .Where(o => o.OrderDate >= startDate
                           && o.OrderDate <= endDate
                           && o.Status == Domain.Enums.EOrderStatus.Completed)
                    .Select(o => new
                    {
                        o.OrderDate,
                        Total = o.OrderItems.Sum(oi => oi.Quantity * oi.UnitPrice)
                    })
                    .ToListAsync(cancellationToken);

                var totalRevenue = orders.Sum(o => o.Total);
                var thisMonthRevenue = orders
                    .Where(o => o.OrderDate >= monthStart)
                    .Sum(o => o.Total);
                var thisWeekRevenue = orders
                    .Where(o => o.OrderDate >= weekStart)
                    .Sum(o => o.Total);
                var todayRevenue = orders
                    .Where(o => o.OrderDate >= todayStart)
                    .Sum(o => o.Total);

                var previousMonthStart = monthStart.AddMonths(-1);
                var previousMonthRevenue = orders
                    .Where(o => o.OrderDate >= previousMonthStart && o.OrderDate < monthStart)
                    .Sum(o => o.Total);
                var previousWeekStart = weekStart.AddDays(-7);
                var previousWeekRevenue = orders
                    .Where(o => o.OrderDate >= previousWeekStart && o.OrderDate < weekStart)
                    .Sum(o => o.Total);
                var previousDayRevenue = orders
                    .Where(o => o.OrderDate >= todayStart.AddDays(-1) && o.OrderDate < todayStart)
                    .Sum(o => o.Total);

                var result = new RevenueOverviewDto
                {
                    TotalRevenue = totalRevenue,
                    ThisMonthRevenue = thisMonthRevenue,
                    ThisWeekRevenue = thisWeekRevenue,
                    TodayRevenue = todayRevenue,
                    MonthGrowthPercentage = previousMonthRevenue != 0 ? Math.Round(((thisMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100, 2) : 0,
                    WeekGrowthPercentage = previousWeekRevenue != 0 ? Math.Round(((thisWeekRevenue - previousWeekRevenue) / previousWeekRevenue) * 100, 2) : 0,
                    DayGrowthPercentage = previousDayRevenue != 0 ? Math.Round(((todayRevenue - previousDayRevenue) / previousDayRevenue) * 100, 2) : 0
                };

                return Result<RevenueOverviewDto>.Success(result);
            }
            catch (Exception ex)
            {
                return Result<RevenueOverviewDto>.BadRequest($"Lỗi khi lấy báo cáo tổng quan doanh thu: {ex.Message}");
            }
        }
    }
}


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
                var endDate = request.EndDate ?? DateTime.Now;
                var startDate = request.StartDate ?? endDate.AddMonths(-12);

                var todayStart = DateTime.Today;
                var weekStart = DateTime.Today.AddDays(-(int)DateTime.Today.DayOfWeek);
                var monthStart = new DateTime(DateTime.Today.Year, DateTime.Today.Month, 1);

                var orders = await _unitOfWork.Orders
                    .GetAllWithIncludeAsync(
                        query => query
                            .Where(o => o.OrderDate >= startDate
                            && o.OrderDate <= endDate
                            && o.Status == Domain.Enums.EOrderStatus.Completed)
                            .Include(o => o.OrderItems),
                        cancellationToken);

                var totalRevenue = orders.Sum(o => o.OrderItems.Sum(oi => oi.Quantity * oi.UnitPrice));
                var thisMonthRevenue = orders
                    .Where(o => o.OrderDate >= monthStart)
                    .Sum(o => o.OrderItems.Sum(oi => oi.Quantity * oi.UnitPrice));
                var thisWeekRevenue = orders
                    .Where(o => o.OrderDate >= weekStart)
                    .Sum(o => o.OrderItems.Sum(oi => oi.Quantity * oi.UnitPrice));
                var todayRevenue = orders
                    .Where(o => o.OrderDate >= todayStart)
                    .Sum(o => o.OrderItems.Sum(oi => oi.Quantity * oi.UnitPrice));

                var previousMonthStart = monthStart.AddMonths(-1);
                var previousMonthEnd = monthStart.AddDays(-1);
                var previousMonthRevenue = orders
                    .Where(o => o.OrderDate >= previousMonthStart && o.OrderDate <= previousMonthEnd)
                    .Sum(o => o.OrderItems.Sum(oi => oi.Quantity * oi.UnitPrice));
                var previousWeekStart = weekStart.AddDays(-7);
                var previousWeekRevenue = orders
                    .Where(o => o.OrderDate >= previousWeekStart && o.OrderDate < weekStart)
                    .Sum(o => o.OrderItems.Sum(oi => oi.Quantity * oi.UnitPrice));
                var previousDayRevenue = orders
                    .Where(o => o.OrderDate >= todayStart.AddDays(-1) && o.OrderDate < todayStart)
                    .Sum(o => o.OrderItems.Sum(oi => oi.Quantity * oi.UnitPrice));

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


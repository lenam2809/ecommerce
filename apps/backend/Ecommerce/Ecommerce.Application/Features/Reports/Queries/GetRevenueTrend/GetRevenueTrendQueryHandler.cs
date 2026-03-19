using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Reports.Dto;
using Ecommerce.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Application.Features.Reports.Queries.GetRevenueTrend
{
    public class GetRevenueTrendQueryHandler : IRequestHandler<GetRevenueTrendQuery, Result<List<RevenueTrendDto>>>
    {
        private readonly IUnitOfWork _unitOfWork;

        public GetRevenueTrendQueryHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<List<RevenueTrendDto>>> Handle(GetRevenueTrendQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var weeksCount = request.WeeksCount ?? 12;
                var endDate = request.EndDate ?? DateTime.Now;
                var startDate = request.StartDate ?? endDate.AddDays(-7 * weeksCount);

                var results = new List<RevenueTrendDto>();

                // Tính toán từng tuần
                var currentWeekStart = GetStartOfWeek(startDate);
                var weekNumber = 1;

                while (currentWeekStart <= endDate && weekNumber <= weeksCount)
                {
                    var weekEnd = currentWeekStart.AddDays(6);
                    if (weekEnd > endDate)
                        weekEnd = endDate;

                    var revenue = await _unitOfWork.Orders
                        .GetAllWithIncludeAsync(
                            query => query
                                .Include(o => o.OrderItems)
                                .Where(o => o.OrderDate >= currentWeekStart && o.OrderDate <= weekEnd
                                       && o.Status == Domain.Enums.EOrderStatus.Completed),
                            cancellationToken)
                        .ContinueWith(task => task.Result
                            .SelectMany(o => o.OrderItems)
                            .Sum(oi => oi.Quantity * oi.UnitPrice),
                            cancellationToken);

                    //var revenue = weeklyRevenue;

                    results.Add(new RevenueTrendDto
                    {
                        Name = $"Tuần {weekNumber}",
                        Revenue = revenue,
                        Week = weekNumber,
                        Year = currentWeekStart.Year,
                        StartDate = currentWeekStart,
                        EndDate = weekEnd
                    });

                    currentWeekStart = currentWeekStart.AddDays(7);
                    weekNumber++;
                }

                return Result<List<RevenueTrendDto>>.Success(results);
            }
            catch (Exception ex)
            {
                return Result<List<RevenueTrendDto>>.BadRequest($"Lỗi khi lấy báo cáo xu hướng doanh thu: {ex.Message}");
            }
        }

        private static DateTime GetStartOfWeek(DateTime date)
        {
            // Lấy thứ 2 là ngày đầu tuần
            var diff = (7 + (date.DayOfWeek - DayOfWeek.Monday)) % 7;
            return date.AddDays(-1 * diff).Date;
        }
    }
}


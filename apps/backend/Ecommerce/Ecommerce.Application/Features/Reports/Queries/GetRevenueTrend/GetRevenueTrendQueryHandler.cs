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
                var endDate = request.EndDate ?? DateTime.UtcNow;
                var startDate = request.StartDate ?? endDate.AddDays(-7 * weeksCount);

                var results = new List<RevenueTrendDto>();

                // Tính toán từng tuần
                var currentWeekStart = GetStartOfWeek(startDate);
                var weekNumber = 1;

                while (currentWeekStart <= endDate && weekNumber <= weeksCount)
                {
                    var nextWeekStart = currentWeekStart.AddDays(7);
                    var effectiveEnd = nextWeekStart <= endDate ? nextWeekStart : endDate;

                    var items = await _unitOfWork.Orders.GetQueryable()
                        .Where(o => o.OrderDate >= currentWeekStart && o.OrderDate < effectiveEnd
                               && o.Status == Domain.Enums.EOrderStatus.Completed)
                        .SelectMany(o => o.OrderItems)
                        .Select(oi => oi.Quantity * oi.UnitPrice)
                        .ToListAsync(cancellationToken);

                    var revenue = items.Sum();

                    results.Add(new RevenueTrendDto
                    {
                        Name = $"Tuần {weekNumber}",
                        Revenue = revenue,
                        Week = weekNumber,
                        Year = currentWeekStart.Year,
                        StartDate = currentWeekStart,
                        EndDate = effectiveEnd
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


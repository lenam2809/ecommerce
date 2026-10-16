using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Reports.Dto;
using Ecommerce.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Application.Features.Reports.Queries.GetRevenueComparison
{
    public class GetRevenueComparisonQueryHandler : IRequestHandler<GetRevenueComparisonQuery, Result<List<RevenueComparisonDto>>>
    {
        private readonly IUnitOfWork _unitOfWork;

        public GetRevenueComparisonQueryHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<List<RevenueComparisonDto>>> Handle(GetRevenueComparisonQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var currentYear = request.CurrentYear ?? DateTime.UtcNow.Year;
                var previousYear = request.PreviousYear ?? (currentYear - 1);
                var monthsCount = request.MonthsCount ?? 6;

                var results = new List<RevenueComparisonDto>();

                for (int i = 1; i <= monthsCount; i++)
                {
                    // Doanh thu năm hiện tại
                    var currentStartDate = new DateTime(currentYear, i, 1, 0, 0, 0, DateTimeKind.Utc);
                    var currentNextMonth = currentStartDate.AddMonths(1);

                    var currentItems = await _unitOfWork.Orders.GetQueryable()
                        .Where(o => o.OrderDate >= currentStartDate && o.OrderDate < currentNextMonth
                               && o.Status == Domain.Enums.EOrderStatus.Completed)
                        .SelectMany(o => o.OrderItems)
                        .Select(oi => oi.Quantity * oi.UnitPrice)
                        .ToListAsync(cancellationToken);

                    var current = currentItems.Sum();

                    // Doanh thu năm trước
                    var previousStartDate = new DateTime(previousYear, i, 1, 0, 0, 0, DateTimeKind.Utc);
                    var previousNextMonth = previousStartDate.AddMonths(1);

                    var previousItems = await _unitOfWork.Orders.GetQueryable()
                        .Where(o => o.OrderDate >= previousStartDate && o.OrderDate < previousNextMonth
                               && o.Status == Domain.Enums.EOrderStatus.Completed)
                        .SelectMany(o => o.OrderItems)
                        .Select(oi => oi.Quantity * oi.UnitPrice)
                        .ToListAsync(cancellationToken);

                    var previous = previousItems.Sum();

                    // Tính tỷ lệ tăng trưởng
                    var growthRate = previous > 0 ? ((current - previous) / previous) * 100 : 0;

                    results.Add(new RevenueComparisonDto
                    {
                        Name = $"Tháng {i}",
                        Current = current,
                        Previous = previous,
                        GrowthRate = Math.Round(growthRate, 2),
                        Month = i,
                        Year = currentYear
                    });
                }

                return Result<List<RevenueComparisonDto>>.Success(results);
            }
            catch (Exception ex)
            {
                return Result<List<RevenueComparisonDto>>.BadRequest($"Lỗi khi lấy báo cáo so sánh doanh thu: {ex.Message}");
            }
        }
    }
}


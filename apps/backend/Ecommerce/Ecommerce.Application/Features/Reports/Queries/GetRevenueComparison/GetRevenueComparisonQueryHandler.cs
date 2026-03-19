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
                var currentYear = request.CurrentYear ?? DateTime.Now.Year;
                var previousYear = request.PreviousYear ?? (currentYear - 1);
                var monthsCount = request.MonthsCount ?? 6;

                var results = new List<RevenueComparisonDto>();

                for (int i = 1; i <= monthsCount; i++)
                {
                    // Doanh thu năm hiện tại
                    var currentStartDate = new DateTime(currentYear, i, 1);
                    var currentEndDate = currentStartDate.AddMonths(1).AddDays(-1);

                    var currentRevenue = await _unitOfWork.Orders
                        .GetAllWithIncludeAsync(
                            query => query
                                .Include(o => o.OrderItems)
                                .Where(o => o.OrderDate >= currentStartDate && o.OrderDate <= currentEndDate
                                       && o.Status == Domain.Enums.EOrderStatus.Completed),
                            cancellationToken)
                        .ContinueWith(task => task.Result
                            .SelectMany(o => o.OrderItems)
                            .Sum(oi => oi.Quantity * oi.UnitPrice),
                            cancellationToken);

                    // Doanh thu năm trước
                    var previousStartDate = new DateTime(previousYear, i, 1);
                    var previousEndDate = previousStartDate.AddMonths(1).AddDays(-1);

                    var previousRevenue = await _unitOfWork.Orders
                        .GetAllWithIncludeAsync(
                            query => query
                                .Include(o => o.OrderItems)
                                .Where(o => o.OrderDate >= previousStartDate && o.OrderDate <= previousEndDate
                                       && o.Status == Domain.Enums.EOrderStatus.Completed),
                            cancellationToken)
                        .ContinueWith(task => task.Result
                            .SelectMany(o => o.OrderItems)
                            .Sum(oi => oi.Quantity * oi.UnitPrice),
                            cancellationToken);

                    var current = currentRevenue;
                    var previous = previousRevenue;

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


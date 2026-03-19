using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Reports.Dto;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Application.Features.Reports.Queries.GetAverageOrderValue
{
    public class GetAverageOrderValueQueryHandler : IRequestHandler<GetAverageOrderValueQuery, Result<List<AverageOrderValueDto>>>
    {
        private readonly IUnitOfWork _unitOfWork;

        public GetAverageOrderValueQueryHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<List<AverageOrderValueDto>>> Handle(GetAverageOrderValueQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var startDate = request.StartDate ?? DateTime.Now.AddMonths(-(request.MonthsCount ?? 12));
                var endDate = request.EndDate ?? DateTime.Now;

                var orders = await _unitOfWork.Orders
                    .GetAllWithIncludeAsync(
                        query => query
                            .Include(o => o.OrderItems)
                            .Where(o => o.OrderDate >= startDate && o.OrderDate <= endDate
                                   && o.Status == EOrderStatus.Completed),
                        cancellationToken);

                var monthlyAOV = orders
                    .GroupBy(o => new { o.OrderDate.Year, o.OrderDate.Month })
                    .Select(g => new AverageOrderValueDto
                    {
                        Name = $"Tháng {g.Key.Month}",
                        Month = g.Key.Month,
                        Year = g.Key.Year,
                        AOV = Math.Round(g.Average(o => o.OrderItems.Sum(oi => oi.Quantity * oi.UnitPrice)), 2),
                        TotalOrders = g.Count(),
                        TotalRevenue = g.Sum(o => o.OrderItems.Sum(oi => oi.Quantity * oi.UnitPrice))
                    })
                    .OrderBy(r => r.Year)
                    .ThenBy(r => r.Month)
                    .Take(request.MonthsCount ?? 12)
                    .ToList();

                return Result<List<AverageOrderValueDto>>.Success(monthlyAOV);
            }
            catch (Exception ex)
            {
                return Result<List<AverageOrderValueDto>>.BadRequest($"Lỗi khi lấy báo cáo giá trị đơn hàng trung bình: {ex.Message}");
            }
        }
    }
}


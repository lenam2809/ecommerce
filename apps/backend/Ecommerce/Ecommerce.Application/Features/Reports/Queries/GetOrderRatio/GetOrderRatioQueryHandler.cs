using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Reports.Dto;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces;
using MediatR;

namespace Ecommerce.Application.Features.Reports.Queries.GetOrderRatio
{
    public class GetOrderRatioQueryHandler : IRequestHandler<GetOrderRatioQuery, Result<List<OrderRatioDto>>>
    {
        private readonly IUnitOfWork _unitOfWork;

        public GetOrderRatioQueryHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<List<OrderRatioDto>>> Handle(GetOrderRatioQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var startDate = request.StartDate ?? DateTime.Now.AddMonths(-(request.MonthsCount ?? 12));
                var endDate = request.EndDate ?? DateTime.Now;

                var orders = await _unitOfWork.Orders
                    .GetAllWithIncludeAsync(
                        query => query.Where(o => o.OrderDate >= startDate && o.OrderDate <= endDate),
                        cancellationToken);

                var monthlyRatios = orders
                    .GroupBy(o => new { o.OrderDate.Year, o.OrderDate.Month })
                    .Select(g => new OrderRatioDto
                    {
                        Name = $"Tháng {g.Key.Month}",
                        Month = g.Key.Month,
                        Year = g.Key.Year,
                        Success = Math.Round((double)g.Count(o => o.Status == EOrderStatus.Completed || o.Status == EOrderStatus.Delivered) / g.Count() * 100, 2),
                        Cancel = Math.Round((double)g.Count(o => o.Status == EOrderStatus.Cancelled || o.Status == EOrderStatus.Returned) / g.Count() * 100, 2),
                        TotalOrders = g.Count()
                    })
                    .OrderBy(r => r.Year)
                    .ThenBy(r => r.Month)
                    .Take(request.MonthsCount ?? 12)
                    .ToList();

                return Result<List<OrderRatioDto>>.Success(monthlyRatios);
            }
            catch (Exception ex)
            {
                return Result<List<OrderRatioDto>>.BadRequest($"Lỗi khi lấy báo cáo tỷ lệ đơn hàng: {ex.Message}");
            }
        }
    }
}


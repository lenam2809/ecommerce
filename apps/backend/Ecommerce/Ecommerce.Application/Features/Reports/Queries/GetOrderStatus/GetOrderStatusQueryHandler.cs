using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Reports.Dto;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces;
using MediatR;

namespace Ecommerce.Application.Features.Reports.Queries.GetOrderStatus
{
    public class GetOrderStatusQueryHandler : IRequestHandler<GetOrderStatusQuery, Result<List<OrderStatusDto>>>
    {
        private readonly IUnitOfWork _unitOfWork;

        public GetOrderStatusQueryHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<List<OrderStatusDto>>> Handle(GetOrderStatusQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var startDate = request.StartDate ?? DateTime.Now.AddYears(-1);
                var endDate = request.EndDate ?? DateTime.Now;

                var orders = await _unitOfWork.Orders
                    .GetAllWithIncludeAsync(
                        query => query.Where(o => o.OrderDate >= startDate && o.OrderDate <= endDate),
                        cancellationToken);

                var statusCounts = orders
                    .GroupBy(o => o.Status)
                    .Select(g => new OrderStatusDto
                    {
                        Name = GetStatusDisplayName(g.Key),
                        Value = g.Count(),
                        Status = g.Key.ToString()
                    })
                    .OrderByDescending(s => s.Value)
                    .ToList();

                // Tính phần trăm
                var totalOrders = statusCounts.Sum(s => s.Value);
                if (totalOrders > 0)
                {
                    foreach (var item in statusCounts)
                    {
                        item.Percentage = Math.Round((double)item.Value / totalOrders * 100, 2);
                    }
                }

                return Result<List<OrderStatusDto>>.Success(statusCounts);
            }
            catch (Exception ex)
            {
                return Result<List<OrderStatusDto>>.BadRequest($"Lỗi khi lấy báo cáo trạng thái đơn hàng: {ex.Message}");
            }
        }

        private string GetStatusDisplayName(EOrderStatus status)
        {
            return status switch
            {
                EOrderStatus.Pending => "Đang xử lý",
                EOrderStatus.Processing => "Đã xác nhận",
                EOrderStatus.Shipped => "Đang giao hàng",
                EOrderStatus.Delivered => "Đã giao hàng",
                EOrderStatus.Completed => "Đã hoàn thành",
                EOrderStatus.Cancelled => "Đã hủy",
                EOrderStatus.Returned => "Đã trả hàng",
                EOrderStatus.Refunded => "Đã hoàn tiền",
                _ => status.ToString()
            };
        }
    }
}


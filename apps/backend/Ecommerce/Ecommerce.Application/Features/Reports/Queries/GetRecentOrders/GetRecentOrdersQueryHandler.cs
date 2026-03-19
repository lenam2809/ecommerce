using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Reports.Dto;
using Ecommerce.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Application.Features.Reports.Queries.GetRecentOrders
{
    public class GetRecentOrdersQueryHandler : IRequestHandler<GetRecentOrdersQuery, Result<List<RecentOrderDto>>>
    {
        private readonly IUnitOfWork _unitOfWork;

        public GetRecentOrdersQueryHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<List<RecentOrderDto>>> Handle(GetRecentOrdersQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var endDate = request.EndDate ?? DateTime.Now;
                var startDate = request.StartDate ?? endDate.AddMonths(-1);

                var orders = await _unitOfWork.Orders
                    .GetAllWithIncludeAsync(
                        query => query
                            .Where(o => o.OrderDate >= startDate && o.OrderDate <= endDate)
                            .Include(o => o.OrderItems)
                            .Include(o => o.ApplicationUser),
                        cancellationToken)
                    .ContinueWith(task => task.Result
                        .OrderByDescending(o => o.OrderDate)
                        .Take(request.Limit)
                        .Select(o => new RecentOrderDto
                        {
                            OrderId = $"#{o.Id}",
                            OrderCode = o.Code,
                            CustomerName = o.ApplicationUser != null ? o.ApplicationUser.FullName : "Unknown",
                            ItemCount = o.OrderItems.Count,
                            TotalAmount = o.OrderItems.Sum(oi => oi.Quantity * oi.UnitPrice)
                        })
                        .ToList(),
                        cancellationToken);

                return Result<List<RecentOrderDto>>.Success(orders);
            }
            catch (Exception ex)
            {
                return Result<List<RecentOrderDto>>.BadRequest($"Lỗi khi lấy danh sách đơn hàng gần đây: {ex.Message}");
            }
        }
    }
}


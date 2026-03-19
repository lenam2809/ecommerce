using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Reports.Dto;
using Ecommerce.Domain.Interfaces;
using MediatR;

namespace Ecommerce.Application.Features.Reports.Queries.GetOrderOverview
{
    public class GetOrderOverviewQueryHandler : IRequestHandler<GetOrderOverviewQuery, Result<OrderOverviewDto>>
    {
        private readonly IUnitOfWork _unitOfWork;

        public GetOrderOverviewQueryHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<OrderOverviewDto>> Handle(GetOrderOverviewQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var endDate = request.EndDate ?? DateTime.Now;
                var startDate = request.StartDate ?? endDate.AddMonths(-12);
                var monthStart = new DateTime(DateTime.Today.Year, DateTime.Today.Month, 1);

                var orders = await _unitOfWork.Orders
                    .GetAllWithIncludeAsync(
                        query => query
                            .Where(o => o.OrderDate >= startDate && o.OrderDate <= endDate),
                        cancellationToken);

                var totalOrders = orders.Count();
                var completedOrders = orders.Count(o => o.Status == Domain.Enums.EOrderStatus.Completed);
                var pendingOrders = orders.Count(o => o.Status == Domain.Enums.EOrderStatus.Pending);
                var canceledOrders = orders.Count(o => o.Status == Domain.Enums.EOrderStatus.Cancelled);

                var previousMonthStart = monthStart.AddMonths(-1);
                var previousMonthEnd = monthStart.AddDays(-1);
                var previousMonthTotal = orders.Count(o => o.OrderDate >= previousMonthStart && o.OrderDate <= previousMonthEnd);
                var previousMonthCompleted = orders.Count(o => o.OrderDate >= previousMonthStart && o.OrderDate <= previousMonthEnd && o.Status == Domain.Enums.EOrderStatus.Completed);
                var previousMonthPending = orders.Count(o => o.OrderDate >= previousMonthStart && o.OrderDate <= previousMonthEnd && o.Status == Domain.Enums.EOrderStatus.Pending);
                var previousMonthCanceled = orders.Count(o => o.OrderDate >= previousMonthStart && o.OrderDate <= previousMonthEnd && o.Status == Domain.Enums.EOrderStatus.Cancelled);

                var result = new OrderOverviewDto
                {
                    TotalOrders = totalOrders,
                    CompletedOrders = completedOrders,
                    PendingOrders = pendingOrders,
                    CanceledOrders = canceledOrders,
                    TotalGrowthPercentage = previousMonthTotal != 0 ? Math.Round(((totalOrders - previousMonthTotal) / (double)previousMonthTotal) * 100, 2) : 0,
                    CompletedGrowthPercentage = previousMonthCompleted != 0 ? Math.Round(((completedOrders - previousMonthCompleted) / (double)previousMonthCompleted) * 100, 2) : 0,
                    PendingGrowthPercentage = previousMonthPending != 0 ? Math.Round(((pendingOrders - previousMonthPending) / (double)previousMonthPending) * 100, 2) : 0,
                    CanceledGrowthPercentage = previousMonthCanceled != 0 ? Math.Round(((canceledOrders - previousMonthCanceled) / (double)previousMonthCanceled) * 100, 2) : 0
                };

                return Result<OrderOverviewDto>.Success(result);
            }
            catch (Exception ex)
            {
                return Result<OrderOverviewDto>.BadRequest($"Lỗi khi lấy báo cáo tổng quan đơn hàng: {ex.Message}");
            }
        }
    }
}


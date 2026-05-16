using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Application.Features.Orders.Queries.GetMyOrderHistoryStats;

public sealed class GetMyOrderHistoryStatsQueryHandler
    : IRequestHandler<GetMyOrderHistoryStatsQuery, Result<MyOrderHistoryStatsDto>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetMyOrderHistoryStatsQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<MyOrderHistoryStatsDto>> Handle(
        GetMyOrderHistoryStatsQuery request,
        CancellationToken cancellationToken)
    {
        try
        {
            var query = _unitOfWork.Orders
                .GetQueryable()
                .Where(order => order.ApplicationUserId == request.UserId);

            var totalOrders = await query.CountAsync(cancellationToken);
            var totalSpent = await query.SumAsync(order => (decimal?)order.TotalAmount, cancellationToken) ?? 0m;
            var averageOrderValue = totalOrders == 0
                ? 0m
                : await query.AverageAsync(order => order.TotalAmount, cancellationToken);

            var statusBreakdown = await query
                .GroupBy(order => order.Status)
                .Select(group => new { Status = group.Key, Count = group.Count() })
                .ToDictionaryAsync(group => group.Status, group => group.Count, cancellationToken);

            var monthlyGroups = await query
                .GroupBy(order => new { order.OrderDate.Year, order.OrderDate.Month })
                .Select(group => new
                {
                    group.Key.Year,
                    group.Key.Month,
                    Count = group.Count(),
                    TotalAmount = group.Sum(order => order.TotalAmount)
                })
                .OrderBy(group => group.Year)
                .ThenBy(group => group.Month)
                .ToListAsync(cancellationToken);

            var stats = new MyOrderHistoryStatsDto
            {
                TotalOrders = totalOrders,
                StatusBreakdown = statusBreakdown,
                MonthlyOrderCount = monthlyGroups
                    .Select(group => new MonthlyOrderCountDto
                    {
                        Period = $"{group.Year}-{group.Month:D2}",
                        Count = group.Count,
                        TotalAmount = group.TotalAmount
                    })
                    .ToList(),
                TotalSpent = totalSpent,
                AverageOrderValue = averageOrderValue
            };

            return Result<MyOrderHistoryStatsDto>.Success(stats);
        }
        catch (Exception ex)
        {
            return Result<MyOrderHistoryStatsDto>.BadRequest(ex.Message);
        }
    }
}

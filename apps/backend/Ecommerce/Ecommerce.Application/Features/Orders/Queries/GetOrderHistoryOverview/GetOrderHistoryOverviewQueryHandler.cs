using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Application.Features.Orders.Queries.GetOrderHistoryOverview;

public sealed class GetOrderHistoryOverviewQueryHandler
    : IRequestHandler<GetOrderHistoryOverviewQuery, Result<OrderHistoryOverviewDto>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetOrderHistoryOverviewQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<OrderHistoryOverviewDto>> Handle(
        GetOrderHistoryOverviewQuery request,
        CancellationToken cancellationToken)
    {
        try
        {
            var query = _unitOfWork.Orders.GetQueryable();

            if (request.FromDate.HasValue)
            {
                query = query.Where(order => order.OrderDate >= request.FromDate.Value);
            }

            if (request.ToDate.HasValue)
            {
                query = query.Where(order => order.OrderDate <= request.ToDate.Value);
            }

            var totalOrders = await query.CountAsync(cancellationToken);
            var totalRevenue = await query.SumAsync(order => (decimal?)order.TotalAmount, cancellationToken) ?? 0m;
            var averageOrderValue = totalOrders == 0
                ? 0m
                : await query.AverageAsync(order => order.TotalAmount, cancellationToken);

            var statusGroups = await query
                .GroupBy(order => order.Status)
                .Select(group => new { Status = group.Key, Count = group.Count() })
                .ToListAsync(cancellationToken);

            var dailyGroups = await query
                .GroupBy(order => new { order.OrderDate.Year, order.OrderDate.Month, order.OrderDate.Day })
                .Select(group => new
                {
                    group.Key.Year,
                    group.Key.Month,
                    group.Key.Day,
                    OrderCount = group.Count(),
                    Revenue = group.Sum(order => order.TotalAmount)
                })
                .OrderBy(group => group.Year)
                .ThenBy(group => group.Month)
                .ThenBy(group => group.Day)
                .ToListAsync(cancellationToken);

            var overview = new OrderHistoryOverviewDto
            {
                Period = new OrderHistoryPeriodDto
                {
                    From = request.FromDate,
                    To = request.ToDate
                },
                Summary = new OrderHistorySummaryDto
                {
                    TotalOrders = totalOrders,
                    TotalRevenue = totalRevenue,
                    AverageOrderValue = averageOrderValue
                },
                StatusDistribution = statusGroups
                    .Select(group => new OrderStatusDistributionDto
                    {
                        Status = group.Status,
                        Count = group.Count,
                        Percentage = totalOrders == 0 ? 0d : (double)group.Count / totalOrders * 100d
                    })
                    .ToList(),
                DailyTrends = dailyGroups
                    .Select(group => new OrderDailyTrendDto
                    {
                        Date = new DateTime(group.Year, group.Month, group.Day, 0, 0, 0, DateTimeKind.Utc),
                        OrderCount = group.OrderCount,
                        Revenue = group.Revenue
                    })
                    .ToList()
            };

            return Result<OrderHistoryOverviewDto>.Success(overview);
        }
        catch (Exception ex)
        {
            return Result<OrderHistoryOverviewDto>.BadRequest(ex.Message);
        }
    }
}

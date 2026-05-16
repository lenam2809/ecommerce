using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Enums;
using MediatR;

namespace Ecommerce.Application.Features.Orders.Queries.GetOrderHistoryOverview;

public sealed class GetOrderHistoryOverviewQuery : IRequest<Result<OrderHistoryOverviewDto>>
{
    public DateTime? FromDate { get; init; }
    public DateTime? ToDate { get; init; }
}

public sealed class OrderHistoryOverviewDto
{
    public OrderHistoryPeriodDto Period { get; init; } = new();
    public OrderHistorySummaryDto Summary { get; init; } = new();
    public List<OrderStatusDistributionDto> StatusDistribution { get; init; } = [];
    public List<OrderDailyTrendDto> DailyTrends { get; init; } = [];
}

public sealed class OrderHistoryPeriodDto
{
    public DateTime? From { get; init; }
    public DateTime? To { get; init; }
}

public sealed class OrderHistorySummaryDto
{
    public int TotalOrders { get; init; }
    public decimal TotalRevenue { get; init; }
    public decimal AverageOrderValue { get; init; }
}

public sealed class OrderStatusDistributionDto
{
    public EOrderStatus Status { get; init; }
    public int Count { get; init; }
    public double Percentage { get; init; }
}

public sealed class OrderDailyTrendDto
{
    public DateTime Date { get; init; }
    public int OrderCount { get; init; }
    public decimal Revenue { get; init; }
}

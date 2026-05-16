using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Enums;
using MediatR;

using Ecommerce.Application.Common.Interfaces;

namespace Ecommerce.Application.Features.Orders.Queries.GetMyOrderHistoryStats;

public sealed class GetMyOrderHistoryStatsQuery : IQuery<Result<MyOrderHistoryStatsDto>>
{
    public Guid UserId { get; init; }
}

public sealed class MyOrderHistoryStatsDto
{
    public int TotalOrders { get; init; }
    public Dictionary<EOrderStatus, int> StatusBreakdown { get; init; } = new();
    public List<MonthlyOrderCountDto> MonthlyOrderCount { get; init; } = [];
    public decimal TotalSpent { get; init; }
    public decimal AverageOrderValue { get; init; }
}

public sealed class MonthlyOrderCountDto
{
    public string Period { get; init; } = string.Empty;
    public int Count { get; init; }
    public decimal TotalAmount { get; init; }
}

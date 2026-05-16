using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Orders.Dto;
using MediatR;

using Ecommerce.Application.Common.Interfaces;

namespace Ecommerce.Application.Features.Orders.Queries.GetOrderAnalytics
{
    public class GetOrderAnalyticsQuery : IQuery<Result<OrderAnalyticsDto>>
    {
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }
}


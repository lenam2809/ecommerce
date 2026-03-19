using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Orders.Dto;
using MediatR;

namespace Ecommerce.Application.Features.Orders.Queries.GetOrderAnalytics
{
    public class GetOrderAnalyticsQuery : IRequest<Result<OrderAnalyticsDto>>
    {
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }
}


using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Orders.Dto;
using MediatR;

using Ecommerce.Application.Common.Interfaces;

namespace Ecommerce.Application.Features.Orders.Queries.GetOrderHistory
{
    public class GetOrderHistoryQuery : IQuery<Result<List<OrderHistoryDto>>>
    {
        public Guid OrderId { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 20;
    }
}


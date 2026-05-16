using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Orders.Dto;
using MediatR;

using Ecommerce.Application.Common.Interfaces;

namespace Ecommerce.Application.Features.Orders.Queries.GetOrdersByUser
{
    public class GetOrdersByUserQuery : IQuery<Result<List<OrderDto>>>
    {
        public Guid UserId { get; set; }
    }
}


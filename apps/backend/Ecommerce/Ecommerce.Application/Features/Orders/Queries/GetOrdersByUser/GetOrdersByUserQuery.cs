using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Orders.Dto;
using MediatR;

namespace Ecommerce.Application.Features.Orders.Queries.GetOrdersByUser
{
    public class GetOrdersByUserQuery : IRequest<Result<List<OrderDto>>>
    {
        public Guid UserId { get; set; }
    }
}


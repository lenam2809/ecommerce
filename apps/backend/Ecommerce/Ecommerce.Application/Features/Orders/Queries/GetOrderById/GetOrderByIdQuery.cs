using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Orders.Dto;
using MediatR;

namespace Ecommerce.Application.Features.Orders.Queries.GetOrderById
{
    public class GetOrderByIdQuery : IRequest<Result<OrderDto>>
    {
        public Guid Id { get; set; }
    }
}


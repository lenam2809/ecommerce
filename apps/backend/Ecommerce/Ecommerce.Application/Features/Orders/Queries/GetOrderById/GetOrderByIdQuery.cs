using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Orders.Dto;
using MediatR;

using Ecommerce.Application.Common.Interfaces;

namespace Ecommerce.Application.Features.Orders.Queries.GetOrderById
{
    public class GetOrderByIdQuery : IQuery<Result<OrderDto>>
    {
        public Guid Id { get; set; }
    }
}


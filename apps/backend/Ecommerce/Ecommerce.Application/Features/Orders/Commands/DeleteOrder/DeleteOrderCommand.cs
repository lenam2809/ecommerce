using Ecommerce.Application.Common.Models;
using MediatR;

namespace Ecommerce.Application.Features.Orders.Commands.DeleteOrder
{
    public class DeleteOrderCommand : IRequest<Result<Unit>>
    {
        public Guid Id { get; set; }
    }
}


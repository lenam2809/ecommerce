using Ecommerce.Application.Common.Models;
using MediatR;

using Ecommerce.Application.Common.Interfaces;

namespace Ecommerce.Application.Features.Orders.Commands.DeleteOrder
{
    public class DeleteOrderCommand : ICommand<Result<Unit>>
    {
        public Guid Id { get; set; }
    }
}


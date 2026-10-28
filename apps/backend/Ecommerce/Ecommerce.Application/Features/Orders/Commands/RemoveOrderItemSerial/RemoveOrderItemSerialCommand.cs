using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using MediatR;

namespace Ecommerce.Application.Features.Orders.Commands.RemoveOrderItemSerial
{
    public class RemoveOrderItemSerialCommand : ICommand<Result<Unit>>
    {
        public Guid OrderId { get; set; }
        public Guid SerialId { get; set; }
    }
}

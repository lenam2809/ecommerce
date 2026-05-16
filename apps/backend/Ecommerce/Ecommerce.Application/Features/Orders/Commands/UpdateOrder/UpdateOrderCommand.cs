using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Enums;
using MediatR;

using Ecommerce.Application.Common.Interfaces;

namespace Ecommerce.Application.Features.Orders.Commands.UpdateOrder
{
    public class UpdateOrderCommand : ICommand<Result<Unit>>
    {
        public Guid Id { get; set; }

        public required string ShippingAddress { get; set; }

        public required string Phone { get; set; }

        public required string Email { get; set; }

        public required string DeliveryInstructions { get; set; }
        public EOrderStatus Status { get; set; }

        public DateTime? ExpectedDeliveryDate { get; set; }
        public required string RowVersion { get; set; }
    }
}


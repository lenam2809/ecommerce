using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Enums;
using MediatR;

namespace Ecommerce.Application.Features.Orders.Commands.UpdateOrder
{
    public class UpdateOrderCommand : IRequest<Result<Unit>>
    {
        public Guid Id { get; set; }

        public string ShippingAddress { get; set; }

        public string Phone { get; set; }

        public string Email { get; set; }

        public string DeliveryInstructions { get; set; }
        public EOrderStatus Status { get; set; }

        public DateTime? ExpectedDeliveryDate { get; set; }
        public string RowVersion { get; set; }
    }
}


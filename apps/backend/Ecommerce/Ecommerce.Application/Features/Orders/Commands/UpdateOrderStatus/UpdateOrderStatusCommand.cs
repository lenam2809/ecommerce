using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Enums;
using MediatR;

using Ecommerce.Application.Common.Interfaces;

namespace Ecommerce.Application.Features.Orders.Commands.UpdateOrderStatus
{
    public class UpdateOrderStatusCommand : ICommand<Result<Unit>>
    {
        public Guid Id { get; set; }
        public EOrderStatus Status { get; set; }
        public DateTime? ExpectedDeliveryDate { get; set; }
        public required string RowVersion { get; set; }
    }
}


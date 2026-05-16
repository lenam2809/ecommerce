using Ecommerce.Application.Common.Mappings;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Orders.Dto;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;
using MediatR;

using Ecommerce.Application.Common.Interfaces;

namespace Ecommerce.Application.Features.Orders.Commands.CreateOrder
{
    public class CreateOrderCommand : ICommand<Result<Guid>>, IMapFrom<Order>
    {
        public Guid? ApplicationUserId { get; set; }
        public string ShippingAddress { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string GuestName { get; set; } = string.Empty;
        public string GuestId { get; set; } = string.Empty;
        public EOrderStatus Status { get; set; } = EOrderStatus.Pending;
        public string DiscountCode { get; set; } = string.Empty;
        public string DeliveryInstructions { get; set; } = string.Empty;
        public DateTime? ExpectedDeliveryDate { get; set; }
        public List<CreateOrderItemDto> OrderItems { get; set; } = [];
    }
}


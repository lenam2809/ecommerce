using Ecommerce.Domain.Enums;
using MediatR;

namespace Ecommerce.Domain.Events
{
    public class OrderStatusChangedEvent : INotification
    {
        public Guid OrderId { get; }
        public string OrderCode { get; }
        public Guid UserId { get; }
        public EOrderStatus OldStatus { get; }
        public EOrderStatus NewStatus { get; }
        public string CustomerEmail { get; }
        public string CustomerName { get; }

        public OrderStatusChangedEvent(
            Guid orderId,
            string orderCode,
            Guid userId,
            EOrderStatus oldStatus,
            EOrderStatus newStatus,
            string customerEmail,
            string customerName)
        {
            OrderId = orderId;
            OrderCode = orderCode;
            UserId = userId;
            OldStatus = oldStatus;
            NewStatus = newStatus;
            CustomerEmail = customerEmail;
            CustomerName = customerName;
        }
    }
}


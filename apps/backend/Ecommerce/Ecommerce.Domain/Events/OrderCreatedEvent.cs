using MediatR;

namespace Ecommerce.Domain.Events
{
    /// <summary>
    /// Event triggered when a new order is created
    /// </summary>
    public class OrderCreatedEvent : INotification
    {
        public Guid OrderId { get; }
        public string OrderCode { get; }
        public Guid? CustomerId { get; }
        public string CustomerEmail { get; }
        public string CustomerName { get; }
        public decimal TotalAmount { get; }
        public int ItemCount { get; }
        public DateTime OrderDate { get; }

        public OrderCreatedEvent(
            Guid orderId,
            string orderCode,
            Guid? customerId,
            string customerEmail,
            string customerName,
            decimal totalAmount,
            int itemCount,
            DateTime orderDate)
        {
            OrderId = orderId;
            OrderCode = orderCode;
            CustomerId = customerId;
            CustomerEmail = customerEmail;
            CustomerName = customerName;
            TotalAmount = totalAmount;
            ItemCount = itemCount;
            OrderDate = orderDate;
        }
    }
}


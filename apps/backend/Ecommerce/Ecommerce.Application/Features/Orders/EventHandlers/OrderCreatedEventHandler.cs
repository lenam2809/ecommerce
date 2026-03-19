using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Domain.Events;
using MediatR;

namespace Ecommerce.Application.Features.Orders.EventHandlers
{
    /// <summary>
    /// Handler for OrderCreatedEvent to send real-time notifications to administrators
    /// </summary>
    public class OrderCreatedEventHandler : INotificationHandler<OrderCreatedEvent>
    {
        private readonly INotificationService _notificationService;

        public OrderCreatedEventHandler(INotificationService notificationService)
        {
            _notificationService = notificationService;
        }

        public async Task Handle(OrderCreatedEvent notification, CancellationToken cancellationToken)
        {
            // Tạo payload thông báo cho quản trị viên
            var payload = new
            {
                notification.OrderId,
                notification.OrderCode,
                notification.CustomerId,
                notification.CustomerEmail,
                notification.CustomerName,
                notification.TotalAmount,
                notification.ItemCount,
                notification.OrderDate,
                NotificationTimestamp = DateTime.Now,
                Message = $"Đơn hàng mới {notification.OrderCode} từ {notification.CustomerName} - {notification.TotalAmount:C}"
            };

            // Gửi thông báo đến nhóm quản trị viên
            await _notificationService.SendNotificationToGroupAsync(
                "Administrators",
                "NewOrder",
                payload,
                cancellationToken);

            // Gửi thông báo admin bằng phương thức có sẵn
            await _notificationService.SendAdminNotificationAsync(
                notification.OrderId,
                "NewOrder");
        }
    }
}


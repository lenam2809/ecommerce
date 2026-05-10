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
        private readonly IEmailQueue _emailQueue;
        private readonly IEmailTemplateRenderer _emailTemplateRenderer;

        public OrderCreatedEventHandler(
            INotificationService notificationService,
            IEmailQueue emailQueue,
            IEmailTemplateRenderer emailTemplateRenderer)
        {
            _notificationService = notificationService;
            _emailQueue = emailQueue;
            _emailTemplateRenderer = emailTemplateRenderer;
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

            if (!string.IsNullOrWhiteSpace(notification.CustomerEmail))
            {
                var trackingUrl = $"/orders/{notification.OrderId}";
                var body = await _emailTemplateRenderer.RenderAsync("OrderConfirmation", new Dictionary<string, string>
                {
                    ["CustomerName"] = notification.CustomerName,
                    ["OrderCode"] = notification.OrderCode,
                    ["OrderDate"] = notification.OrderDate.ToString("dd/MM/yyyy HH:mm"),
                    ["ItemCount"] = notification.ItemCount.ToString(),
                    ["TotalAmount"] = notification.TotalAmount.ToString("N0"),
                    ["TrackingUrl"] = trackingUrl
                }, cancellationToken);

                await _emailQueue.QueueEmailAsync(new EmailMessage(
                    notification.CustomerEmail,
                    $"ShopViet xac nhan don hang {notification.OrderCode}",
                    body,
                    $"Don hang {notification.OrderCode} da duoc ghi nhan."), cancellationToken);
            }
        }
    }
}


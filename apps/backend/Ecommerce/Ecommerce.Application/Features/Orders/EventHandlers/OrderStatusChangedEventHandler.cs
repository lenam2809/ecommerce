using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Events;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Domain.Interfaces.Logging;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Application.Features.Orders.EventHandlers
{
    public class OrderStatusChangedEventHandler : INotificationHandler<OrderStatusChangedEvent>
    {
        private readonly INotificationService _notificationService;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IEnhancedLogger _logger;
        private readonly IEmailQueue _emailQueue;
        private readonly IEmailTemplateRenderer _emailTemplateRenderer;

        public OrderStatusChangedEventHandler(
            INotificationService notificationService,
            IUnitOfWork unitOfWork,
            IEnhancedLogger logger,
            IEmailQueue emailQueue,
            IEmailTemplateRenderer emailTemplateRenderer)
        {
            _notificationService = notificationService;
            _unitOfWork = unitOfWork;
            _logger = logger;
            _emailQueue = emailQueue;
            _emailTemplateRenderer = emailTemplateRenderer;
        }

        public async Task Handle(OrderStatusChangedEvent notification, CancellationToken cancellationToken)
        {
            // 1. Send notification via SignalR/Email
            await _notificationService.SendOrderStatusNotificationAsync(
                notification.UserId,
                notification.OrderId,
                notification.OldStatus,
                notification.NewStatus);

            // 2. Handle specific status logic
            if (notification.NewStatus == EOrderStatus.Cancelled)
            {
                await RestoreStockQuantities(notification.OrderId, cancellationToken);
            }

            await _logger.LogAsync(ELogLevel.Information,
                "Order {OrderId} with code {OrderCode} changed from {OldStatus} to {NewStatus}",
                "OrderStatusChanged",
                properties: new Dictionary<string, object?>
                {
                    { "OrderId", notification.OrderId },
                    { "OrderCode", notification.OrderCode },
                    { "OldStatus", notification.OldStatus },
                    { "NewStatus", notification.NewStatus }
                });

            if (!string.IsNullOrWhiteSpace(notification.CustomerEmail))
            {
                var body = await _emailTemplateRenderer.RenderAsync("OrderStatusChanged", new Dictionary<string, string>
                {
                    ["CustomerName"] = string.IsNullOrWhiteSpace(notification.CustomerName) ? "Customer" : notification.CustomerName,
                    ["OrderCode"] = notification.OrderCode,
                    ["OldStatus"] = notification.OldStatus.ToString(),
                    ["NewStatus"] = notification.NewStatus.ToString(),
                    ["TrackingUrl"] = $"/orders/{notification.OrderId}"
                }, cancellationToken);

                await _emailQueue.QueueEmailAsync(new EmailMessage(
                    notification.CustomerEmail,
                    $"ShopViet cap nhat don hang {notification.OrderCode}",
                    body,
                    $"Don hang {notification.OrderCode} da chuyen sang trang thai {notification.NewStatus}."), cancellationToken);
            }
        }

        private async Task RestoreStockQuantities(Guid orderId, CancellationToken cancellationToken)
        {
            var order = await _unitOfWork.Orders.GetOrderWithItemsAndProductsAsync(orderId, cancellationToken);
            if (order == null) return;

            // Check if stock was already restored for this order cancellation to ensure idempotency
            var alreadyRestored = await _unitOfWork.OrderHistories.GetQueryable()
                .AnyAsync(h => h.OrderId == orderId && h.Notes == "StockRestored", cancellationToken);
            if (alreadyRestored)
            {
                await _logger.LogAsync(ELogLevel.Information,
                    "Stock already restored for order {OrderId}, skipping duplicate restoration",
                    "RestoreOrderStock",
                    properties: new Dictionary<string, object?> { { "OrderId", orderId } });
                return;
            }

            foreach (var item in order.OrderItems)
            {
                if (item.ProductVariantSkuId.HasValue)
                {
                    await _unitOfWork.ProductVariantSkus.RestoreStockAsync(
                        item.ProductVariantSkuId.Value,
                        item.Quantity,
                        cancellationToken);
                }
                else
                {
                    await _unitOfWork.Products.RestoreStockAsync(
                        item.ProductId,
                        item.Quantity,
                        cancellationToken);
                }
            }

            await _unitOfWork.OrderHistories.AddAsync(new OrderHistory
            {
                OrderId = orderId,
                FromStatus = EOrderStatus.Cancelled,
                ToStatus = EOrderStatus.Cancelled,
                Notes = "StockRestored",
                ChangedBy = "System",
                ChangeSource = "InventoryRestore",
                ChangedAt = DateTime.UtcNow
            }, cancellationToken);

            await _logger.LogAsync(ELogLevel.Information,
                "Restored stock for {ItemCount} items in order {OrderId}",
                "RestoreOrderStock",
                properties: new Dictionary<string, object?>
                {
                    { "ItemCount", order.OrderItems.Count },
                    { "OrderId", orderId }
                });
        }
    }
}

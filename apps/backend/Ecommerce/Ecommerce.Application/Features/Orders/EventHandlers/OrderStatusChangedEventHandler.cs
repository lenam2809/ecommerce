using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Events;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Domain.Interfaces.Logging;
using MediatR;

namespace Ecommerce.Application.Features.Orders.EventHandlers
{
    public class OrderStatusChangedEventHandler : INotificationHandler<OrderStatusChangedEvent>
    {
        private readonly INotificationService _notificationService;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IEnhancedLogger _logger;

        public OrderStatusChangedEventHandler(
            INotificationService notificationService,
            IUnitOfWork unitOfWork,
            IEnhancedLogger logger)
        {
            _notificationService = notificationService;
            _unitOfWork = unitOfWork;
            _logger = logger;
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
        }

        private async Task RestoreStockQuantities(Guid orderId, CancellationToken cancellationToken)
        {
            var order = await _unitOfWork.Orders.GetOrderWithItemsAndProductsAsync(orderId, cancellationToken);
            if (order != null)
            {
                foreach (var item in order.OrderItems)
                {
                    var product = await _unitOfWork.Products.GetByIdAsync(item.ProductId, cancellationToken);
                    if (product != null)
                    {
                        product.AdjustStock(item.Quantity);
                        _unitOfWork.Products.Update(product);
                    }
                }
                
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
}

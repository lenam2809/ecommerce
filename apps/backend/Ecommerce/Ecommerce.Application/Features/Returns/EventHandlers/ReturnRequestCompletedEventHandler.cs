using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Events;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Domain.Interfaces.Logging;
using MediatR;

namespace Ecommerce.Application.Features.Returns.EventHandlers
{
    public class ReturnRequestCompletedEventHandler : INotificationHandler<ReturnRequestCompletedEvent>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IEnhancedLogger _logger;

        public ReturnRequestCompletedEventHandler(
            IUnitOfWork unitOfWork,
            IEnhancedLogger logger)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        public async Task Handle(ReturnRequestCompletedEvent notification, CancellationToken cancellationToken)
        {
            var returnRequest = await _unitOfWork.ReturnRequests.GetWithDetailsAsync(notification.ReturnRequestId, cancellationToken);
            if (returnRequest == null)
            {
                await _logger.LogAsync(
                    ELogLevel.Warning,
                    "ReturnRequest {ReturnRequestId} not found for completion event",
                    "ReturnRequestCompleted",
                    properties: new Dictionary<string, object?> { { "ReturnRequestId", notification.ReturnRequestId } });
                return;
            }

            // Only restore stock if the return request is Completed
            if (returnRequest.Status != EReturnStatus.Completed)
            {
                await _logger.LogAsync(
                    ELogLevel.Warning,
                    "ReturnRequest {ReturnRequestId} status is {Status}, not Completed. Stock restoration aborted.",
                    "ReturnRequestCompleted",
                    properties: new Dictionary<string, object?>
                    {
                        { "ReturnRequestId", notification.ReturnRequestId },
                        { "Status", returnRequest.Status }
                    });
                return;
            }

            // Quality check requirement: Item must have passed QualityCheck
            var passedQualityCheck = returnRequest.StatusHistory.Any(h => h.Status == EReturnStatus.QualityCheck);
            if (!passedQualityCheck)
            {
                await _logger.LogAsync(
                    ELogLevel.Warning,
                    "ReturnRequest {ReturnRequestId} did not pass QualityCheck. Stock restoration aborted.",
                    "ReturnRequestCompleted",
                    properties: new Dictionary<string, object?> { { "ReturnRequestId", notification.ReturnRequestId } });
                return;
            }

            // Idempotency: check if stock has already been restored for this return request
            var alreadyRestored = returnRequest.StatusHistory.Any(h => h.Note?.Contains("StockRestored") == true);
            if (alreadyRestored)
            {
                await _logger.LogAsync(
                    ELogLevel.Information,
                    "Stock already restored for ReturnRequest {ReturnRequestId}, skipping duplicate restoration",
                    "ReturnRequestCompleted",
                    properties: new Dictionary<string, object?> { { "ReturnRequestId", notification.ReturnRequestId } });
                return;
            }

            // Find the Order and OrderItem
            var order = await _unitOfWork.Orders.GetOrderWithItemsAndProductsAsync(returnRequest.OrderId, cancellationToken);
            var orderItem = order?.OrderItems.FirstOrDefault(oi => oi.Id == returnRequest.OrderItemId);
            if (orderItem == null)
            {
                await _logger.LogAsync(
                    ELogLevel.Error,
                    "OrderItem {OrderItemId} in Order {OrderId} not found for ReturnRequest {ReturnRequestId}",
                    "ReturnRequestCompleted",
                    properties: new Dictionary<string, object?>
                    {
                        { "ReturnRequestId", notification.ReturnRequestId },
                        { "OrderId", returnRequest.OrderId },
                        { "OrderItemId", returnRequest.OrderItemId }
                    });
                return;
            }

            // Restore stock to the appropriate entity
            if (orderItem.ProductVariantSkuId.HasValue)
            {
                await _unitOfWork.ProductVariantSkus.RestoreStockAsync(
                    orderItem.ProductVariantSkuId.Value,
                    returnRequest.Quantity,
                    cancellationToken);
            }
            else
            {
                await _unitOfWork.Products.RestoreStockAsync(
                    orderItem.ProductId,
                    returnRequest.Quantity,
                    cancellationToken);
            }

            // Mark stock as restored in ReturnRequest status history for idempotency
            returnRequest.MarkStockRestored();

            await _logger.LogAsync(
                ELogLevel.Information,
                "Restored {Quantity} units for ReturnRequest {ReturnRequestId} (OrderItem: {OrderItemId}, SkuId: {SkuId}, ProductId: {ProductId})",
                "ReturnRequestCompleted",
                properties: new Dictionary<string, object?>
                {
                    { "ReturnRequestId", returnRequest.Id },
                    { "ReturnRequestCode", returnRequest.Code },
                    { "Quantity", returnRequest.Quantity },
                    { "OrderItemId", orderItem.Id },
                    { "ProductVariantSkuId", orderItem.ProductVariantSkuId },
                    { "ProductId", orderItem.ProductId }
                });
        }
    }
}

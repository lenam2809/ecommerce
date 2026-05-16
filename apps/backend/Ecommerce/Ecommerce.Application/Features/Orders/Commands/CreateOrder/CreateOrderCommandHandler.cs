using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Orders.Dto;
using Ecommerce.Application.Features.PromoCodes.Commands.ApplyPromoCode;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Exceptions;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Domain.Interfaces.Logging;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Application.Features.Orders.Commands.CreateOrder
{
    public class CreateOrderCommandHandler : IRequestHandler<CreateOrderCommand, Result<Guid>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IEnhancedLogger _logger;
        private readonly IPublisher _publisher;
        private readonly ICurrentUserService _currentUserService;
        private readonly IOrderCodeGenerator _orderCodeGenerator;

        public CreateOrderCommandHandler(
            IUnitOfWork unitOfWork,
            IEnhancedLogger logger,
            IPublisher publisher,
            ICurrentUserService currentUserService,
            IOrderCodeGenerator orderCodeGenerator)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
            _publisher = publisher;
            _currentUserService = currentUserService;
            _orderCodeGenerator = orderCodeGenerator;
        }

        public async Task<Result<Guid>> Handle(CreateOrderCommand request, CancellationToken cancellationToken)
        {
            try
            {
                for (var attempt = 1; attempt <= 3; attempt++)
                {
                    var decrementedStockItems = new List<OrderStockItem>();

                    try
                    {
                        var orderContext = await BuildOrderContextAsync(request, cancellationToken);
                        if (orderContext.ErrorResult != null)
                        {
                            return orderContext.ErrorResult;
                        }

                        var order = orderContext.Order!;
                        var customerNameForEvent = orderContext.CustomerNameForEvent;
                        var stockItems = new List<OrderStockItem>();
                        PromoRedeemContext? promoRedeemContext = null;

                        foreach (var item in request.OrderItems)
                        {
                            if (item.Quantity <= 0)
                            {
                                return Result<Guid>.BadRequest("Số lượng phải lớn hơn 0");
                            }

                            var product = await _unitOfWork.Products.GetByIdAsync(item.ProductId, cancellationToken);
                            if (product == null)
                            {
                                return Result<Guid>.BadRequest($"Khong tim thay san pham voi ID {item.ProductId}");
                            }

                            var stockItem = await ResolveOrderStockItemAsync(item, product, cancellationToken);
                            if (stockItem.ErrorResult != null)
                            {
                                return stockItem.ErrorResult;
                            }

                            order.AddOrderItem(
                                product.Id,
                                product.Name,
                                product.Image,
                                stockItem.UnitPrice,
                                item.Quantity,
                                item.Color,
                                item.Size,
                                stockItem.ProductVariantSkuId,
                                stockItem.SkuCode,
                                stockItem.VariantInfo);

                            stockItems.Add(stockItem);
                        }

                        if (!string.IsNullOrWhiteSpace(request.DiscountCode))
                        {
                            promoRedeemContext = await ValidatePromoCodeForOrderAsync(order, request.DiscountCode);
                            if (promoRedeemContext.ErrorResult != null)
                            {
                                return promoRedeemContext.ErrorResult;
                            }
                        }

                        foreach (var stockItem in stockItems)
                        {
                            var stockDecremented = await TryDecrementStockAsync(stockItem, cancellationToken);
                            if (!stockDecremented)
                            {
                                await RestoreDecrementedStockAsync(decrementedStockItems, cancellationToken);
                                _unitOfWork.ClearTracking();
                                return Result<Guid>.BadRequest(stockItem.OutOfStockMessage);
                            }

                            decrementedStockItems.Add(stockItem);
                        }

                        if (promoRedeemContext?.PromoCode != null)
                        {
                            var promoRedeemResult = await RedeemPromoCodeAsync(order, promoRedeemContext, decrementedStockItems, cancellationToken);
                            if (promoRedeemResult != null)
                            {
                                return promoRedeemResult;
                            }
                        }

                        order.FinalizeCreation(customerNameForEvent);

                        await _unitOfWork.Orders.AddAsync(order, cancellationToken);
                        await _unitOfWork.CompleteAsync(cancellationToken);

                        await _logger.LogAsync(
                            ELogLevel.Information,
                            "Order created successfully for {OrderId} with code {OrderCode}",
                            "CreateOrder",
                            properties: new Dictionary<string, object?>
                            {
                                { "OrderId", order.Id },
                                { "OrderCode", order.Code }
                            });

                        return Result<Guid>.Success(order.Id);
                    }
                    catch (DbUpdateConcurrencyException ex) when (attempt < 3)
                    {
                        foreach (var entry in ex.Entries)
                        {
                            await entry.ReloadAsync(cancellationToken);
                        }

                        _unitOfWork.ClearTracking();
                    }
                    catch (DbUpdateConcurrencyException)
                    {
                        _unitOfWork.ClearTracking();
                        return Result<Guid>.BadRequest("Out of stock");
                    }
                    catch (DbUpdateException ex) when (IsUniqueCodeViolation(ex) && attempt < 3)
                    {
                        await RestoreDecrementedStockAsync(decrementedStockItems, cancellationToken);
                        _unitOfWork.ClearTracking();
                    }
                    catch (DbUpdateException ex) when (IsUniqueCodeViolation(ex))
                    {
                        await RestoreDecrementedStockAsync(decrementedStockItems, cancellationToken);
                        _unitOfWork.ClearTracking();
                        return Result<Guid>.Conflict("Mã đơn hàng đã tồn tại, vui lòng thử lại.");
                    }
                }

                return Result<Guid>.BadRequest("Out of stock");
            }
            catch (DomainException dex)
            {
                return Result<Guid>.BadRequest(dex.Message);
            }
            catch (Exception ex)
            {
                await _logger.LogExceptionAsync(ex, "Loi xay ra khi tao don hang");
                return Result<Guid>.BadRequest($"Tao don hang that bai: {ex.Message}");
            }
        }

        private async Task<CreateOrderContext> BuildOrderContextAsync(CreateOrderCommand request, CancellationToken cancellationToken)
        {
            if (request.ApplicationUserId.HasValue)
            {
                var orderCode = _orderCodeGenerator.Generate();
                var customer = await _unitOfWork.Users.GetByIdAsync(request.ApplicationUserId.Value);
                if (customer == null)
                {
                    return CreateOrderContext.WithError(Result<Guid>.BadRequest("Khong tim thay khach hang"));
                }

                var customerNameForEvent = $"{customer.FirstName} {customer.LastName}".Trim();

                var order = Order.Create(
                    request.ApplicationUserId.Value,
                    customerNameForEvent,
                    request.Email ?? customer.Email,
                    request.Phone,
                    request.ShippingAddress,
                    null,
                    request.DeliveryInstructions,
                    request.ExpectedDeliveryDate,
                    orderCode);

                return CreateOrderContext.WithOrder(order, customerNameForEvent);
            }

            var guestName = request.GuestName.Trim();
            var guestOrderCode = _orderCodeGenerator.Generate();
            var guestOrder = Order.CreateGuestOrder(
                request.Email,
                guestName,
                request.Phone,
                request.ShippingAddress,
                null,
                request.DeliveryInstructions,
                request.ExpectedDeliveryDate,
                string.IsNullOrWhiteSpace(request.GuestId) ? _currentUserService.GuestId : request.GuestId.Trim(),
                guestOrderCode);

            return CreateOrderContext.WithOrder(guestOrder, guestName);
        }

        private async Task<PromoRedeemContext> ValidatePromoCodeForOrderAsync(Order order, string discountCode)
        {
            var promoCode = await _unitOfWork.PromoCodes.GetByCodeAsync(discountCode);
            var validationError = ApplyPromoCodeCommandHandler.ValidatePromoCode(promoCode, order.TotalAmount, DateTime.UtcNow);
            if (validationError != null)
            {
                return PromoRedeemContext.WithError(Result<Guid>.BadRequest(validationError));
            }

            var (discountAmount, _) = ApplyPromoCodeCommandHandler.CalculateDiscount(promoCode!, order.TotalAmount);
            return PromoRedeemContext.Valid(promoCode!, discountAmount);
        }

        private async Task<Result<Guid>?> RedeemPromoCodeAsync(
            Order order,
            PromoRedeemContext promoRedeemContext,
            List<OrderStockItem> decrementedStockItems,
            CancellationToken cancellationToken)
        {
            var rowsAffected = await _unitOfWork.BaseRepository<PromoCode>().ExecuteCommandAsync(
                "UPDATE \"PromoCodes\" " +
                "SET \"TimesUsed\" = \"TimesUsed\" + 1 " +
                "WHERE \"Code\" = {0} " +
                "AND \"IsActive\" = TRUE " +
                "AND \"ValidFrom\" <= {1} " +
                "AND \"ValidTo\" >= {1} " +
                "AND (\"UsageLimit\" = 0 OR \"TimesUsed\" < \"UsageLimit\")",
                [promoRedeemContext.PromoCode!.Code, DateTime.UtcNow],
                cancellationToken);

            if (rowsAffected == 0)
            {
                await RestoreDecrementedStockAsync(decrementedStockItems, cancellationToken);
                _unitOfWork.ClearTracking();
                return Result<Guid>.BadRequest("Mã giảm giá không hợp lệ hoặc đã đạt giới hạn sử dụng");
            }

            order.ApplyDiscount(promoRedeemContext.PromoCode.Code, promoRedeemContext.DiscountAmount);
            return null;
        }

        private async Task<OrderStockItem> ResolveOrderStockItemAsync(
            CreateOrderItemDto item,
            Product product,
            CancellationToken cancellationToken)
        {
            if (product.HasVariants)
            {
                if (!item.ProductVariantSkuId.HasValue)
                {
                    return OrderStockItem.WithError(
                        Result<Guid>.BadRequest($"Sản phẩm {product.Name} yêu cầu chọn SKU biến thể"));
                }

                var sku = await _unitOfWork.ProductVariantSkus.GetByIdAsync(item.ProductVariantSkuId.Value, cancellationToken);
                if (sku == null || sku.ProductId != product.Id || !sku.IsActive)
                {
                    return OrderStockItem.WithError(
                        Result<Guid>.BadRequest($"SKU biến thể không hợp lệ cho sản phẩm: {product.Name}"));
                }

                if (sku.StockQuantity < item.Quantity)
                {
                    return OrderStockItem.WithError(
                        Result<Guid>.BadRequest($"Không đủ hàng trong kho cho SKU: {sku.Sku}"));
                }

                return OrderStockItem.ForSku(product.Id, sku.Id, item.Quantity, sku.EffectivePrice, sku.Sku, BuildVariantInfo(item), sku.Sku);
            }

            if (item.ProductVariantSkuId.HasValue)
            {
                return OrderStockItem.WithError(
                    Result<Guid>.BadRequest($"Sản phẩm {product.Name} không sử dụng SKU biến thể"));
            }

            if (product.StockQuantity < item.Quantity)
            {
                return OrderStockItem.WithError(
                    Result<Guid>.BadRequest($"Khong du hang trong kho cho san pham: {product.Name}"));
            }

            var unitPrice = product.SalePrice.HasValue && product.SalePrice.Value > 0
                ? product.SalePrice.Value
                : product.Price;

            return OrderStockItem.ForProduct(product.Id, item.Quantity, unitPrice, product.Name);
        }

        private async Task<bool> TryDecrementStockAsync(OrderStockItem stockItem, CancellationToken cancellationToken)
        {
            if (stockItem.ProductVariantSkuId.HasValue)
            {
                return await _unitOfWork.ProductVariantSkus.TryDecrementStockAsync(
                    stockItem.ProductVariantSkuId.Value,
                    stockItem.ProductId,
                    stockItem.Quantity,
                    cancellationToken);
            }

            return await _unitOfWork.Products.TryDecrementStockAsync(
                stockItem.ProductId,
                stockItem.Quantity,
                cancellationToken);
        }

        private async Task RestoreDecrementedStockAsync(List<OrderStockItem> decrementedStockItems, CancellationToken cancellationToken)
        {
            foreach (var stockItem in decrementedStockItems)
            {
                if (stockItem.ProductVariantSkuId.HasValue)
                {
                    await _unitOfWork.ProductVariantSkus.RestoreStockAsync(
                        stockItem.ProductVariantSkuId.Value,
                        stockItem.Quantity,
                        cancellationToken);
                    continue;
                }

                await _unitOfWork.Products.RestoreStockAsync(
                    stockItem.ProductId,
                    stockItem.Quantity,
                    cancellationToken);
            }
        }

        private static string BuildVariantInfo(CreateOrderItemDto item)
        {
            return string.Join(" / ", new[] { item.Color, item.Size }.Where(value => !string.IsNullOrWhiteSpace(value)));
        }

        private static bool IsUniqueCodeViolation(DbUpdateException exception)
        {
            var message = exception.InnerException?.Message ?? exception.Message;
            return message.Contains("IX_Orders_Code", StringComparison.OrdinalIgnoreCase)
                   || (message.Contains("Orders", StringComparison.OrdinalIgnoreCase)
                       && message.Contains("Code", StringComparison.OrdinalIgnoreCase)
                       && (message.Contains("unique", StringComparison.OrdinalIgnoreCase)
                           || message.Contains("duplicate", StringComparison.OrdinalIgnoreCase)));
        }

        private sealed class CreateOrderContext
        {
            public Order? Order { get; private init; }
            public string CustomerNameForEvent { get; private init; } = string.Empty;
            public Result<Guid>? ErrorResult { get; private init; }

            public static CreateOrderContext WithOrder(Order order, string customerName) =>
                new() { Order = order, CustomerNameForEvent = customerName };

            public static CreateOrderContext WithError(Result<Guid> errorResult) =>
                new() { ErrorResult = errorResult };
        }

        private sealed class PromoRedeemContext
        {
            public PromoCode? PromoCode { get; private init; }
            public decimal DiscountAmount { get; private init; }
            public Result<Guid>? ErrorResult { get; private init; }

            public static PromoRedeemContext Valid(PromoCode promoCode, decimal discountAmount) =>
                new() { PromoCode = promoCode, DiscountAmount = discountAmount };

            public static PromoRedeemContext WithError(Result<Guid> errorResult) =>
                new() { ErrorResult = errorResult };
        }

        private sealed class OrderStockItem
        {
            public Guid ProductId { get; private init; }
            public Guid? ProductVariantSkuId { get; private init; }
            public int Quantity { get; private init; }
            public decimal UnitPrice { get; private init; }
            public string SkuCode { get; private init; } = string.Empty;
            public string VariantInfo { get; private init; } = string.Empty;
            public string OutOfStockMessage { get; private init; } = string.Empty;
            public Result<Guid>? ErrorResult { get; private init; }

            public static OrderStockItem ForProduct(Guid productId, int quantity, decimal unitPrice, string productName) =>
                new()
                {
                    ProductId = productId,
                    Quantity = quantity,
                    UnitPrice = unitPrice,
                    OutOfStockMessage = $"Không đủ hàng trong kho cho sản phẩm: {productName}"
                };

            public static OrderStockItem ForSku(
                Guid productId,
                Guid skuId,
                int quantity,
                decimal unitPrice,
                string skuCode,
                string variantInfo,
                string sku) =>
                new()
                {
                    ProductId = productId,
                    ProductVariantSkuId = skuId,
                    Quantity = quantity,
                    UnitPrice = unitPrice,
                    SkuCode = skuCode,
                    VariantInfo = variantInfo,
                    OutOfStockMessage = $"Không đủ hàng trong kho cho SKU: {sku}"
                };

            public static OrderStockItem WithError(Result<Guid> errorResult) =>
                new() { ErrorResult = errorResult };
        }
    }
}

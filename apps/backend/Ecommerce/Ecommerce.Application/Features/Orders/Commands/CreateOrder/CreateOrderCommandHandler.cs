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
        private readonly IGuestCartService? _guestCartService;

        public CreateOrderCommandHandler(
            IUnitOfWork unitOfWork,
            IEnhancedLogger logger,
            IPublisher publisher,
            ICurrentUserService currentUserService,
            IOrderCodeGenerator orderCodeGenerator,
            IGuestCartService? guestCartService = null)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
            _publisher = publisher;
            _currentUserService = currentUserService;
            _orderCodeGenerator = orderCodeGenerator;
            _guestCartService = guestCartService;
        }

        public async Task<Result<Guid>> Handle(CreateOrderCommand request, CancellationToken cancellationToken)
        {
            try
            {
                // 🔒 SECURITY (H4): defense-in-depth — kể cả khi controller sót, handler
                // vẫn LUÔN ghi đè bằng danh tính đã xác thực, không dùng giá trị client gửi.
                if (_currentUserService.UserId.HasValue)
                {
                    request.ApplicationUserId = _currentUserService.UserId.Value;
                }
                // Guest: UserId = null → giữ ApplicationUserId = null → đi nhánh guest order
                // (guestId sẽ được lấy từ signed cookie server-side — sẽ vá ở H6).

                for (var attempt = 1; attempt <= 3; attempt++)
                {
                    var decrementedStockItems = new List<OrderStockItem>();
                    string? redeemedPromoCode = null;

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

                            decimal addOnPrice = 0;
                            string? addOnName = null;
                            int warrantyMonths = 24;
                            if (item.AddOnId.HasValue && item.AddOnId.Value != Guid.Empty)
                            {
                                var addOn = await _unitOfWork.BaseRepository<ProductAddOn>()
                                    .GetByIdAsync(item.AddOnId.Value, cancellationToken);
                                if (addOn != null && addOn.IsActive)
                                {
                                    addOnPrice = addOn.Price;
                                    addOnName = addOn.Name;
                                    warrantyMonths = addOn.DurationMonths ?? 24;
                                }
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
                                stockItem.VariantInfo,
                                item.AddOnId,
                                addOnName,
                                addOnPrice,
                                warrantyMonths);

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

                            redeemedPromoCode = promoRedeemContext.PromoCode.Code;
                        }

                        order.Subtotal = order.TotalAmount + (promoRedeemContext?.DiscountAmount ?? 0);
                        order.DiscountAmount = promoRedeemContext?.DiscountAmount ?? 0;

                        var isCod = string.Equals(order.PaymentMethod, "COD", StringComparison.OrdinalIgnoreCase);
                        if (isCod && order.TotalAmount > 20_000_000m)
                        {
                            order.DepositRequired = Math.Round(order.TotalAmount * 0.10m);
                            order.DepositStatus = EDepositStatus.Pending;
                            order.DepositAmount = 0;
                            order.RemainingAmount = order.TotalAmount - order.DepositRequired;
                        }
                        else
                        {
                            order.DepositRequired = 0;
                            order.DepositStatus = EDepositStatus.None;
                            order.DepositAmount = 0;
                            order.RemainingAmount = order.TotalAmount;
                        }

                        order.FinalizeCreation(customerNameForEvent);

                        if (request.ApplicationUserId.HasValue && _unitOfWork.Carts != null)
                        {
                            var userCart = await _unitOfWork.Carts.GetQueryable()
                                .Include(c => c.CartItems)
                                .FirstOrDefaultAsync(c => c.ApplicationUserId == request.ApplicationUserId.Value, cancellationToken);
                            if (userCart != null)
                            {
                                foreach (var cartItem in userCart.CartItems.ToList())
                                {
                                    _unitOfWork.BaseRepository<CartItem>().Delete(cartItem);
                                }
                                userCart.Clear();
                            }
                        }

                        await _unitOfWork.Orders.AddAsync(order, cancellationToken);
                        await _unitOfWork.CompleteAsync(cancellationToken);

                        if (!string.IsNullOrEmpty(_currentUserService.GuestId) && _guestCartService != null)
                        {
                            try
                            {
                                await _guestCartService.DeleteCartAsync(_currentUserService.GuestId, cancellationToken);
                            }
                            catch (Exception ex)
                            {
                                await _logger.LogExceptionAsync(ex, "Failed to clear guest cart in Redis after order creation");
                            }
                        }

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
                        await RestoreDecrementedStockAsync(decrementedStockItems, cancellationToken);
                        if (redeemedPromoCode != null)
                        {
                            await RevertPromoCodeRedemptionAsync(redeemedPromoCode, cancellationToken);
                        }
                        foreach (var entry in ex.Entries)
                        {
                            await entry.ReloadAsync(cancellationToken);
                        }

                        _unitOfWork.ClearTracking();
                    }
                    catch (DbUpdateConcurrencyException)
                    {
                        await RestoreDecrementedStockAsync(decrementedStockItems, cancellationToken);
                        if (redeemedPromoCode != null)
                        {
                            await RevertPromoCodeRedemptionAsync(redeemedPromoCode, cancellationToken);
                        }
                        _unitOfWork.ClearTracking();
                        return Result<Guid>.BadRequest("Out of stock");
                    }
                    catch (DbUpdateException ex) when (IsUniqueCodeViolation(ex) && attempt < 3)
                    {
                        await RestoreDecrementedStockAsync(decrementedStockItems, cancellationToken);
                        if (redeemedPromoCode != null)
                        {
                            await RevertPromoCodeRedemptionAsync(redeemedPromoCode, cancellationToken);
                        }
                        _unitOfWork.ClearTracking();
                    }
                    catch (DbUpdateException ex) when (IsUniqueCodeViolation(ex))
                    {
                        await RestoreDecrementedStockAsync(decrementedStockItems, cancellationToken);
                        if (redeemedPromoCode != null)
                        {
                            await RevertPromoCodeRedemptionAsync(redeemedPromoCode, cancellationToken);
                        }
                        _unitOfWork.ClearTracking();
                        return Result<Guid>.Conflict("Mã đơn hàng đã tồn tại, vui lòng thử lại.");
                    }
                    catch (Exception)
                    {
                        await RestoreDecrementedStockAsync(decrementedStockItems, cancellationToken);
                        if (redeemedPromoCode != null)
                        {
                            await RevertPromoCodeRedemptionAsync(redeemedPromoCode, cancellationToken);
                        }
                        _unitOfWork.ClearTracking();
                        throw;
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
            var shippingAddress = request.ShippingAddress;
            if (request.ShowroomId.HasValue && string.IsNullOrWhiteSpace(shippingAddress))
            {
                var showroom = await _unitOfWork.BaseRepository<Showroom>()
                    .GetByIdAsync(request.ShowroomId.Value, cancellationToken);
                shippingAddress = showroom != null
                    ? $"Nhận tại Showroom {showroom.Name} ({showroom.Address})"
                    : "Nhận tại showroom";
            }

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
                    shippingAddress,
                    null,
                    request.DeliveryInstructions,
                    request.ExpectedDeliveryDate,
                    orderCode);

                ConfigureOrder(order, request);

                return CreateOrderContext.WithOrder(order, customerNameForEvent);
            }

            var guestName = request.GuestName.Trim();
            var guestOrderCode = _orderCodeGenerator.Generate();
            var guestOrder = Order.CreateGuestOrder(
                request.Email,
                guestName,
                request.Phone,
                shippingAddress,
                null,
                request.DeliveryInstructions,
                request.ExpectedDeliveryDate,
                // 🔒 SECURITY (H6): KHÔNG dùng GuestId từ body nữa — lấy từ cookie guest_id
                // do server cấp (qua _currentUserService.GuestId)
                _currentUserService.GuestId,
                guestOrderCode);

            ConfigureOrder(guestOrder, request);

            return CreateOrderContext.WithOrder(guestOrder, guestName);
        }

        private static void ConfigureOrder(Order order, CreateOrderCommand request)
        {
            order.DeliveryMethod = !string.IsNullOrWhiteSpace(request.DeliveryMethod)
                ? request.DeliveryMethod
                : (request.ShowroomId.HasValue ? "ShowroomPickup" : "StandardDelivery");

            order.DeliveryType = request.ShowroomId.HasValue
                ? EDeliveryType.ShowroomPickup
                : request.DeliveryType;

            order.ShowroomId = request.ShowroomId;
            order.PickupShowroomId = request.ShowroomId;
            order.PaymentMethod = !string.IsNullOrWhiteSpace(request.PaymentMethod) ? request.PaymentMethod : "COD";

            var requireInvoice = request.RequireInvoice || (request.Invoice != null && request.Invoice.RequireInvoice);
            if (requireInvoice)
            {
                var taxCode = (request.Invoice != null && !string.IsNullOrWhiteSpace(request.Invoice.TaxCode)) ? request.Invoice.TaxCode : request.TaxCode;
                var companyName = (request.Invoice != null && !string.IsNullOrWhiteSpace(request.Invoice.CompanyName)) ? request.Invoice.CompanyName : request.CompanyName;
                var companyAddress = (request.Invoice != null && !string.IsNullOrWhiteSpace(request.Invoice.CompanyAddress)) ? request.Invoice.CompanyAddress : request.CompanyAddress;
                var invoiceEmail = (request.Invoice != null && !string.IsNullOrWhiteSpace(request.Invoice.InvoiceEmail)) ? request.Invoice.InvoiceEmail : (request.InvoiceEmail ?? request.Email);

                order.Invoice = new Ecommerce.Domain.ValueObjects.OrderInvoice(true, taxCode, companyName, companyAddress, invoiceEmail);
            }
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
            try
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
            catch (Exception ex)
            {
                await _logger.LogExceptionAsync(ex, "Failed to explicitly restore decremented stock; transaction rollback will revert it.");
            }
        }

        private async Task RevertPromoCodeRedemptionAsync(string promoCode, CancellationToken cancellationToken)
        {
            try
            {
                await _unitOfWork.BaseRepository<PromoCode>().ExecuteCommandAsync(
                    "UPDATE \"PromoCodes\" " +
                    "SET \"TimesUsed\" = CASE WHEN \"TimesUsed\" > 0 THEN \"TimesUsed\" - 1 ELSE 0 END " +
                    "WHERE \"Code\" = {0}",
                    [promoCode],
                    cancellationToken);
            }
            catch (Exception ex)
            {
                await _logger.LogExceptionAsync(ex, $"Khong the hoan lai ma giam gia: {promoCode}");
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

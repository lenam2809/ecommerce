using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
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

        public CreateOrderCommandHandler(
            IUnitOfWork unitOfWork,
            IEnhancedLogger logger,
            IPublisher publisher,
            ICurrentUserService currentUserService)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
            _publisher = publisher;
            _currentUserService = currentUserService;
        }

        public async Task<Result<Guid>> Handle(CreateOrderCommand request, CancellationToken cancellationToken)
        {
            try
            {
                for (var attempt = 1; attempt <= 3; attempt++)
                {
                    try
                    {
                        var orderContext = await BuildOrderContextAsync(request, cancellationToken);
                        if (orderContext.ErrorResult != null)
                        {
                            return orderContext.ErrorResult;
                        }

                        var order = orderContext.Order!;
                        var customerNameForEvent = orderContext.CustomerNameForEvent;

                        foreach (var item in request.OrderItems)
                        {
                            var product = await _unitOfWork.Products.GetByIdAsync(item.ProductId, cancellationToken);
                            if (product == null)
                            {
                                return Result<Guid>.BadRequest($"Khong tim thay san pham voi ID {item.ProductId}");
                            }

                            if (product.StockQuantity < item.Quantity)
                            {
                                return Result<Guid>.BadRequest($"Khong du hang trong kho cho san pham: {product.Name}");
                            }

                            order.AddOrderItem(
                                product.Id,
                                product.Name,
                                product.Image,
                                product.SalePrice.HasValue && product.SalePrice.Value > 0 ? product.SalePrice.Value : product.Price,
                                item.Quantity,
                                item.Color,
                                item.Size);

                            // B3 FIX: Atomic stock deduction – tránh race condition
                            // SQL UPDATE có điều kiện: chỉ trừ khi StockQuantity >= quantity
                            // Nếu có concurrent request khác đã lấy hết hàng thì rowsAffected = 0
                            var rowsAffected = await _unitOfWork.BaseRepository<Product>().ExecuteCommandAsync(
                                "UPDATE \"Products\" SET \"StockQuantity\" = \"StockQuantity\" - {0} " +
                                "WHERE \"Id\" = {1} AND \"StockQuantity\" >= {0}",
                                [item.Quantity, product.Id],
                                cancellationToken);

                            if (rowsAffected == 0)
                            {
                                // Race condition: sản phẩm hết hàng giữa lúc check và update
                                _unitOfWork.ClearTracking();
                                return Result<Guid>.BadRequest($"Không đủ hàng trong kho cho sản phẩm: {product.Name}");
                            }
                            // Stock đã được update bởi SQL trực tiếp, không cần gọi Products.Update()
                            // để tránh EF ghi đè lại giá trị cũ khi SaveChanges

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
                    request.DiscountCode,
                    request.DeliveryInstructions,
                    request.ExpectedDeliveryDate);

                return CreateOrderContext.WithOrder(order, customerNameForEvent);
            }

            var guestName = request.GuestName.Trim();
            var guestOrder = Order.CreateGuestOrder(
                request.Email,
                guestName,
                request.Phone,
                request.ShippingAddress,
                request.DiscountCode,
                request.DeliveryInstructions,
                request.ExpectedDeliveryDate,
                string.IsNullOrWhiteSpace(request.GuestId) ? _currentUserService.GuestId : request.GuestId.Trim());

            return CreateOrderContext.WithOrder(guestOrder, guestName);
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
    }
}

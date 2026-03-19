using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Events;
using Ecommerce.Domain.Exceptions;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Domain.Interfaces.Logging;
using MediatR;

namespace Ecommerce.Application.Features.Orders.Commands.CreateOrder
{
    public class CreateOrderCommandHandler : IRequestHandler<CreateOrderCommand, Result<Guid>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IEnhancedLogger _logger;
        private readonly IPublisher _publisher;

        public CreateOrderCommandHandler(IUnitOfWork unitOfWork, IEnhancedLogger logger, IPublisher publisher)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
            _publisher = publisher;
        }

        public async Task<Result<Guid>> Handle(CreateOrderCommand request, CancellationToken cancellationToken)
        {
            try
            {
                // Validate request data (basic validation)
                if (request.OrderItems == null || request.OrderItems.Count == 0)
                {
                    return Result<Guid>.BadRequest("Đơn hàng phải có ít nhất một sản phẩm");
                }

                // Get Customer
                var customer = await _unitOfWork.Users.GetByIdAsync(request.ApplicationUserId.Value);
                if (customer == null)
                {
                    return Result<Guid>.BadRequest("Không tìm thấy khách hàng");
                }

                // Create Order using Factory Method (Domain Logic)
                var order = Order.Create(
                    request.ApplicationUserId.Value,
                    $"{customer.FirstName} {customer.LastName}".Trim(),
                    request.Email ?? customer.Email, // Prefer request email
                    request.Phone,
                    request.ShippingAddress,
                    request.DiscountCode,
                    request.DeliveryInstructions,
                    request.ExpectedDeliveryDate
                );

                // Process Items
                foreach (var item in request.OrderItems)
                {
                    var product = await _unitOfWork.Products
                        .GetByIdAsync(item.ProductId, cancellationToken);

                    if (product == null)
                    {
                        return Result<Guid>.BadRequest($"Không tìm thấy sản phẩm với ID {item.ProductId}");
                    }

                    if (product.StockQuantity < item.Quantity)
                    {
                        return Result<Guid>.BadRequest($"Không đủ hàng trong kho cho sản phẩm: {product.Name}");
                    }

                    // Add Item via Domain Method (Encapsulates logic/calculations)
                    order.AddOrderItem(
                        product.Id,
                        product.Name,
                        product.Image,
                        product.SalePrice.HasValue && product.SalePrice.Value > 0 ? product.SalePrice.Value : product.Price,
                        item.Quantity,
                        item.Color,
                        item.Size
                    );

                    // Update Stock (Keep in Application Service or move to Domain Service)
                    product.AdjustStock(-item.Quantity);
                    _unitOfWork.Products.Update(product);
                }

                // Finalize Order Creation (Domain Validation & Event Generation)
                order.FinalizeCreation($"{customer.FirstName} {customer.LastName}".Trim());

                // Persist
                await _unitOfWork.Orders.AddAsync(order, cancellationToken);
                await _unitOfWork.CompleteAsync(cancellationToken);

                await _logger.LogAsync(ELogLevel.Information,
                    $"Đã tạo đơn hàng thành công. ID: {order.Id}, Mã: {order.Code}",
                    "Tạo đơn hàng");

                return Result<Guid>.Success(order.Id);
            }
            catch (DomainException dex)
            {
                 return Result<Guid>.BadRequest(dex.Message);
            }
            catch (Exception ex)
            {
                await _logger.LogExceptionAsync(ex, "Lỗi xảy ra khi tạo đơn hàng");
                return Result<Guid>.BadRequest($"Tạo đơn hàng thất bại: {ex.Message}");
            }
        }
    }
}

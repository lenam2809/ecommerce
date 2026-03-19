using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Domain.Interfaces.Logging;
using System.Text.Json;

namespace Ecommerce.Infrastructure.Services
{
    public class OrderHistoryService : IOrderHistoryService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IEnhancedLogger _logger;

        public OrderHistoryService(IUnitOfWork unitOfWork, IEnhancedLogger logger)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        public async Task RecordStatusChangeAsync(Order originalOrder, Order updatedOrder, string changedBy, string changeSource = "Manual", string notes = null, CancellationToken cancellationToken = default)
        {
            try
            {
                var history = new OrderHistory
                {
                    OrderId = originalOrder.Id,
                    FromStatus = originalOrder.Status,
                    ToStatus = updatedOrder.Status,
                    Notes = notes ?? $"Trạng thái đơn hàng được thay đổi từ {originalOrder.Status} thành {updatedOrder.Status}",
                    ChangedBy = changedBy,
                    ChangeSource = changeSource,
                    ChangedAt = DateTime.UtcNow,
                    PreviousExpectedDeliveryDate = originalOrder.ExpectedDeliveryDate,
                    NewExpectedDeliveryDate = updatedOrder.ExpectedDeliveryDate
                };

                // Lưu thêm thông tin khác nếu có thay đổi
                var additionalData = new Dictionary<string, object>();

                if (originalOrder.TotalAmount != updatedOrder.TotalAmount)
                {
                    history.PreviousTotalAmount = originalOrder.TotalAmount;
                    history.NewTotalAmount = updatedOrder.TotalAmount;
                    additionalData["TotalAmountChanged"] = true;
                }

                if (originalOrder.ShippingAddress != updatedOrder.ShippingAddress)
                {
                    history.PreviousShippingAddress = originalOrder.ShippingAddress;
                    history.NewShippingAddress = updatedOrder.ShippingAddress;
                    additionalData["ShippingAddressChanged"] = true;
                }

                if (originalOrder.DiscountCode != updatedOrder.DiscountCode)
                {
                    history.PreviousDiscountCode = originalOrder.DiscountCode;
                    history.NewDiscountCode = updatedOrder.DiscountCode;
                    additionalData["DiscountCodeChanged"] = true;
                }
                if (originalOrder.Status != updatedOrder.Status)
                {
                    additionalData["StatusChanged"] = true;
                }

                if (additionalData.Any())
                {
                    history.AdditionalData = JsonSerializer.Serialize(additionalData);
                }

                await _unitOfWork.OrderHistories.AddAsync(history, cancellationToken);

                await _logger.LogAsync(ELogLevel.Information,
                    $"Lịch sử đơn hàng đã được ghi lại. OrderId: {originalOrder.Id}, From: {originalOrder.Status}, To: {updatedOrder.Status}",
                    "Ghi lại lịch sử đơn hàng");
            }
            catch (Exception ex)
            {
                await _logger.LogExceptionAsync(ex, $"Lỗi khi ghi lại lịch sử đơn hàng {originalOrder.Id}");
                throw;
            }
        }

        public async Task RecordOrderUpdateAsync(Order originalOrder, Order updatedOrder, string changedBy, string changeSource = "Manual", string notes = null, CancellationToken cancellationToken = default)
        {
            try
            {
                var changes = new List<string>();
                var additionalData = new Dictionary<string, object>();

                // Check for changes
                if (originalOrder.TotalAmount != updatedOrder.TotalAmount)
                {
                    changes.Add($"Tổng tiền: {originalOrder.TotalAmount:C} → {updatedOrder.TotalAmount:C}");
                    additionalData["TotalAmountChanged"] = new { From = originalOrder.TotalAmount, To = updatedOrder.TotalAmount };
                }

                if (originalOrder.ShippingAddress != updatedOrder.ShippingAddress)
                {
                    changes.Add("Địa chỉ giao hàng đã thay đổi");
                    additionalData["ShippingAddressChanged"] = new { From = originalOrder.ShippingAddress, To = updatedOrder.ShippingAddress };
                }

                if (originalOrder.Phone != updatedOrder.Phone)
                {
                    changes.Add($"Số điện thoại: {originalOrder.Phone} → {updatedOrder.Phone}");
                    additionalData["PhoneChanged"] = new { From = originalOrder.Phone, To = updatedOrder.Phone };
                }

                if (originalOrder.Email != updatedOrder.Email)
                {
                    changes.Add($"Email: {originalOrder.Email} → {updatedOrder.Email}");
                    additionalData["EmailChanged"] = new { From = originalOrder.Email, To = updatedOrder.Email };
                }

                if (originalOrder.DiscountCode != updatedOrder.DiscountCode)
                {
                    changes.Add($"Mã giảm giá: {originalOrder.DiscountCode ?? "Không có"} → {updatedOrder.DiscountCode ?? "Không có"}");
                    additionalData["DiscountCodeChanged"] = new { From = originalOrder.DiscountCode, To = updatedOrder.DiscountCode };
                }

                if (originalOrder.DeliveryInstructions != updatedOrder.DeliveryInstructions)
                {
                    changes.Add("Hướng dẫn giao hàng đã thay đổi");
                    additionalData["DeliveryInstructionsChanged"] = new { From = originalOrder.DeliveryInstructions, To = updatedOrder.DeliveryInstructions };
                }

                if (changes.Any())
                {
                    var history = new OrderHistory
                    {
                        OrderId = originalOrder.Id,
                        FromStatus = originalOrder.Status,
                        ToStatus = updatedOrder.Status,
                        Notes = notes ?? $"Cập nhật thông tin đơn hàng: {string.Join(", ", changes)}",
                        ChangedBy = changedBy,
                        ChangeSource = changeSource,
                        ChangedAt = DateTime.UtcNow,
                        PreviousTotalAmount = originalOrder.TotalAmount,
                        NewTotalAmount = updatedOrder.TotalAmount,
                        PreviousShippingAddress = originalOrder.ShippingAddress,
                        NewShippingAddress = updatedOrder.ShippingAddress,
                        PreviousExpectedDeliveryDate = originalOrder.ExpectedDeliveryDate,
                        NewExpectedDeliveryDate = updatedOrder.ExpectedDeliveryDate,
                        PreviousDiscountCode = originalOrder.DiscountCode,
                        NewDiscountCode = updatedOrder.DiscountCode,
                        AdditionalData = JsonSerializer.Serialize(additionalData)
                    };

                    await _unitOfWork.OrderHistories.AddAsync(history, cancellationToken);

                    await _logger.LogAsync(ELogLevel.Information,
                        $"Lịch sử cập nhật đơn hàng đã được ghi lại. OrderId: {originalOrder.Id}, Changes: {changes.Count}",
                        "Ghi lại lịch sử cập nhật đơn hàng");
                }
            }
            catch (Exception ex)
            {
                await _logger.LogExceptionAsync(ex, $"Lỗi khi ghi lại lịch sử cập nhật đơn hàng {originalOrder.Id}");
                throw;
            }
        }

        public async Task RecordOrderCreationAsync(Order order, string changedBy, string changeSource = "System", CancellationToken cancellationToken = default)
        {
            try
            {
                var history = new OrderHistory
                {
                    OrderId = order.Id,
                    FromStatus = EOrderStatus.Pending, // Giả định trạng thái ban đầu
                    ToStatus = order.Status,
                    Notes = $"Đơn hàng được tạo với mã {order.Code}",
                    ChangedBy = changedBy,
                    ChangeSource = changeSource,
                    ChangedAt = DateTime.UtcNow,
                    NewTotalAmount = order.TotalAmount,
                    NewShippingAddress = order.ShippingAddress,
                    NewExpectedDeliveryDate = order.ExpectedDeliveryDate,
                    NewDiscountCode = order.DiscountCode,
                    AdditionalData = JsonSerializer.Serialize(new
                    {
                        OrderCode = order.Code,
                        ItemCount = order.OrderItems?.Count ?? 0,
                        CreatedAt = order.OrderDate
                    })
                };

                await _unitOfWork.OrderHistories.AddAsync(history, cancellationToken);

                await _logger.LogAsync(ELogLevel.Information,
                    $"Lịch sử tạo đơn hàng đã được ghi lại. OrderId: {order.Id}, Code: {order.Code}",
                    "Ghi lại lịch sử tạo đơn hàng");
            }
            catch (Exception ex)
            {
                await _logger.LogExceptionAsync(ex, $"Lỗi khi ghi lại lịch sử tạo đơn hàng {order.Id}");
                throw;
            }
        }

        public async Task<IEnumerable<OrderHistory>> GetOrderHistoryAsync(Guid orderId, CancellationToken cancellationToken = default)
        {
            return await _unitOfWork.OrderHistories.GetByOrderIdAsync(orderId, cancellationToken);
        }
    }
}


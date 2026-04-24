using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Exceptions;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Domain.Interfaces.Logging;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Application.Features.Orders.Commands.UpdateOrderStatus
{
    public class UpdateOrderStatusCommandHandler : IRequestHandler<UpdateOrderStatusCommand, Result<Unit>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IEnhancedLogger _logger;
        private readonly IOrderHistoryService _orderHistoryService;
        private readonly ICurrentUserService _currentUserService;

        public UpdateOrderStatusCommandHandler(
            IUnitOfWork unitOfWork,
            IEnhancedLogger logger,
            IOrderHistoryService orderHistoryService,
            ICurrentUserService currentUserService)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
            _orderHistoryService = orderHistoryService;
            _currentUserService = currentUserService;
        }

        public async Task<Result<Unit>> Handle(UpdateOrderStatusCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var order = await _unitOfWork.Orders.GetOrderWithItemsAndProductsAsync(request.Id, cancellationToken);

                if (order == null)
                {
                    return Result<Unit>.NotFound($"Không tìm thấy đơn hàng với ID {request.Id}");
                }

                // Áp dụng Concurrency Token từ client nếu có để kiểm tra xung đột
                if (!string.IsNullOrEmpty(request.RowVersion))
                {
                    order.ConcurrencyToken = Convert.FromBase64String(request.RowVersion);
                }

                // Lưu trạng thái ban đầu để so sánh (Sử dụng Snapshot vì setters là private)
                var originalOrder = order.Snapshot();

                // Update status via Domain Entity (Logic validate và update nằm trong Entity)
                // Entity sẽ throw DomainException nếu chuyển trạng thái không hợp lệ
                order.UpdateStatus(request.Status, null, request.ExpectedDeliveryDate);

                // Update the order
                _unitOfWork.Orders.Update(order);

                // Record the status change in history
                await _orderHistoryService.RecordStatusChangeAsync(
                    originalOrder,
                    order,
                    _currentUserService.Email, // Có thể thay bằng ID người dùng thực tế
                    "API",
                    GetStatusChangeNote(originalOrder.Status, request.Status),
                    cancellationToken);

                await _unitOfWork.CompleteAsync(cancellationToken);

                await _logger.LogAsync(ELogLevel.Information,
                    "Order status updated for {OrderId} to {OrderStatus}",
                    "UpdateOrderStatus",
                    properties: new Dictionary<string, object?>
                    {
                        { "OrderId", order.Id },
                        { "OrderStatus", order.Status }
                    });

                return Result<Unit>.Success(Unit.Value);
            }
            catch (DbUpdateConcurrencyException)
            {
                await _logger.LogAsync(
                    ELogLevel.Error,
                    "Concurrency conflict while updating order {OrderId}",
                    "UpdateOrderStatusConcurrencyConflict",
                    properties: new Dictionary<string, object?>
                    {
                        { "OrderId", request.Id }
                    });
                return Result<Unit>.Conflict("Dữ liệu đã bị thay đổi bởi người dùng khác. Vui lòng tải lại trang và thử lại.");
            }
            catch (DomainException dex)
            {
                await _logger.LogAsync(ELogLevel.Warning, dex.Message, "Lỗi Domain khi cập nhật đơn hàng");
                return Result<Unit>.BadRequest(dex.Message);
            }
            catch (Exception ex)
            {
                await _logger.LogExceptionAsync(ex, "Đã xảy ra lỗi khi cập nhật trạng thái đơn hàng");
                return Result<Unit>.BadRequest($"Cập nhật trạng thái đơn hàng thất bại: {ex.Message}");
            }
        }

        private static string GetStatusChangeNote(EOrderStatus fromStatus, EOrderStatus toStatus)
        {
            return (fromStatus, toStatus) switch
            {
                (EOrderStatus.Pending, EOrderStatus.Processing) => "Đơn hàng đã được xác nhận và bắt đầu xử lý",
                (EOrderStatus.Processing, EOrderStatus.Shipped) => "Đơn hàng đã được giao cho đơn vị vận chuyển",
                (EOrderStatus.Shipped, EOrderStatus.Delivered) => "Đơn hàng đã được giao thành công",
                (EOrderStatus.Delivered, EOrderStatus.Completed) => "Đơn hàng đã hoàn thành",
                (EOrderStatus.Pending, EOrderStatus.Cancelled) => "Đơn hàng đã bị hủy trước khi xử lý",
                (EOrderStatus.Processing, EOrderStatus.Cancelled) => "Đơn hàng đã bị hủy trong quá trình xử lý",
                (EOrderStatus.Delivered, EOrderStatus.ReturnRequested) => "Khách hàng yêu cầu trả hàng",
                (EOrderStatus.Shipped, EOrderStatus.ReturnRequested) => "Khách hàng yêu cầu trả hàng khi đang giao",
                (EOrderStatus.ReturnRequested, EOrderStatus.Returned) => "Hàng đã được trả về",
                (EOrderStatus.Returned, EOrderStatus.Refunded) => "Đã hoàn tiền cho khách hàng",
                _ => $"Trạng thái đơn hàng được thay đổi từ {fromStatus} thành {toStatus}"
            };
        }
    }
}

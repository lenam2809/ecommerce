using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Exceptions;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Domain.Interfaces.Logging;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Application.Features.Orders.Commands.UpdateOrder
{
    [Authorize(Policy = EPermissions.EditOrder)]
    public class UpdateOrderCommandHandler : IRequestHandler<UpdateOrderCommand, Result<Unit>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICurrentUserService _currentUserService;
        private readonly IOrderHistoryService _orderHistoryService;
        private readonly IEnhancedLogger _logger;

        public UpdateOrderCommandHandler(
            IUnitOfWork unitOfWork,
            ICurrentUserService currentUserService,
            IOrderHistoryService orderHistoryService,
            IEnhancedLogger logger)
        {
            _unitOfWork = unitOfWork;
            _currentUserService = currentUserService;
            _orderHistoryService = orderHistoryService;
            _logger = logger;
        }

        public async Task<Result<Unit>> Handle(UpdateOrderCommand request, CancellationToken cancellationToken)
        {
            try
            {
                if (_currentUserService.UserId == null)
                {
                    return Result<Unit>.Unauthorized();
                }

                var order = await _unitOfWork.Orders.GetOrderWithItemsAndProductsAsync(request.Id, cancellationToken);
                if (order == null)
                {
                    return Result<Unit>.NotFound("Không tìm thấy đơn hàng.");
                }

                // Áp dụng Concurrency Token từ client nếu có để kiểm tra xung đột
                if (!string.IsNullOrEmpty(request.RowVersion))
                {
                    order.ConcurrencyToken = Convert.FromBase64String(request.RowVersion);
                }

                // Lưu trạng thái ban đầu để so sánh (Sử dụng Snapshot vì setters là private)
                var originalOrder = order.Snapshot();

                var currentUser = await _unitOfWork.Users.GetByIdAsync(_currentUserService.UserId.Value);
                var currentUserRoles = await _unitOfWork.Users.GetRolesAsync(currentUser);

                // Check permissions based on role
                if (currentUserRoles.Contains(EUserRoles.Customer) && order.ApplicationUserId != _currentUserService.UserId)
                {
                    return Result<Unit>.Forbidden("Bạn không có quyền cập nhật đơn hàng này");
                }

                if (currentUserRoles.Contains(EUserRoles.Staff) && !currentUserRoles.Contains(EUserRoles.Admin))
                {
                    var orderUser = await _unitOfWork.Users.GetByIdAsync(order.ApplicationUserId!.Value);
                    var orderUserRoles = await _unitOfWork.Users.GetRolesAsync(orderUser);
                    if (orderUserRoles.Contains(EUserRoles.Admin))
                    {
                        return Result<Unit>.Forbidden("Nhân viên không thể cập nhật lệnh quản trị");
                    }
                }

                // Customers can only update orders in Pending status
                if (currentUserRoles.Contains(EUserRoles.Customer) && order.Status != EOrderStatus.Pending)
                {
                    return Result<Unit>.BadRequest("Không thể cập nhật đơn hàng không ở trạng thái Đang chờ xử lý");
                }

                // Cập nhật thông tin đơn hàng
                order.UpdateInfo(
                    request.ShippingAddress,
                    request.Phone,
                    request.Email,
                    request.DeliveryInstructions
                );

                // Determine ExpectedDeliveryDate based on permissions
                DateTime? expectedDeliveryDate = null;
                if (request.ExpectedDeliveryDate.HasValue &&
                    (currentUserRoles.Contains(EUserRoles.Staff) || currentUserRoles.Contains(EUserRoles.Admin)))
                {
                    expectedDeliveryDate = request.ExpectedDeliveryDate;
                }

                // Cập nhật trạng thái (và ngày giao dự kiến nếu có)
                // Entity sẽ tự validate chuyển trạng thái
                order.UpdateStatus(request.Status, null, expectedDeliveryDate);
                
                // Manual update timestamp if needed, otherwise rely on Interceptor/BaseEntity
                // order.UpdatedAt = DateTime.Now; 

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

                return Result<Unit>.Success(Unit.Value);
            }
            catch (DbUpdateConcurrencyException)
            {
                await _logger.LogAsync(
                    ELogLevel.Error,
                    "Concurrency conflict while updating order {OrderId}",
                    "UpdateOrderConcurrencyConflict",
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
                await _logger.LogExceptionAsync(ex, "Đã xảy ra lỗi khi cập nhật đơn hàng");
                return Result<Unit>.BadRequest($"Cập nhật đơn hàng thất bại: {ex.Message}");
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


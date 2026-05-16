using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Domain.Interfaces.Logging;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Application.Features.Returns.Commands.CreateReturnRequest
{
    public class CreateReturnRequestCommandHandler
        : IRequestHandler<CreateReturnRequestCommand, Result<Guid>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IEnhancedLogger _logger;
        private readonly IRmaCodeGenerator _rmaCodeGenerator;
        private readonly ICurrentUserService _currentUserService;

        public CreateReturnRequestCommandHandler(
            IUnitOfWork unitOfWork,
            IEnhancedLogger logger,
            IRmaCodeGenerator rmaCodeGenerator,
            ICurrentUserService currentUserService)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
            _rmaCodeGenerator = rmaCodeGenerator;
            _currentUserService = currentUserService;
        }

        public async Task<Result<Guid>> Handle(
            CreateReturnRequestCommand request, CancellationToken cancellationToken)
        {
            var currentUserId = _currentUserService.UserId;
            if (!currentUserId.HasValue)
            {
                return Result<Guid>.Unauthorized();
            }

            var order = await _unitOfWork.Orders.GetByIdAsync(request.OrderId, cancellationToken);
            if (order is null)
            {
                return Result<Guid>.NotFound("Đơn hàng không tồn tại.");
            }

            if (order.ApplicationUserId != currentUserId.Value)
            {
                return Result<Guid>.Forbidden("Bạn không có quyền tạo yêu cầu đổi/trả cho đơn hàng này.");
            }

            request.CustomerId = currentUserId.Value;

            if (order.Status != EOrderStatus.Delivered)
            {
                return Result<Guid>.BadRequest("Chỉ được đổi/trả hàng khi đơn đã giao thành công.");
            }

            var deliveredDate = order.UpdatedAt ?? order.CreatedAt;
            if ((DateTime.UtcNow - deliveredDate).TotalDays > 7)
            {
                return Result<Guid>.BadRequest("Đã quá hạn đổi/trả 7 ngày kể từ ngày nhận hàng.");
            }

            var orderItem = order.OrderItems.FirstOrDefault(i => i.Id == request.OrderItemId);
            if (orderItem is null)
            {
                return Result<Guid>.NotFound("Sản phẩm không thuộc đơn hàng này.");
            }

            if (request.Quantity <= 0 || request.Quantity > orderItem.Quantity)
            {
                return Result<Guid>.BadRequest($"Số lượng đổi/trả không hợp lệ. Tối đa: {orderItem.Quantity}.");
            }

            for (var attempt = 1; attempt <= 3; attempt++)
            {
                var refundAmount = orderItem.UnitPrice * request.Quantity;
                var returnRequest = ReturnRequest.Create(
                    request.OrderId,
                    request.OrderItemId,
                    request.CustomerId,
                    request.Type,
                    request.Reason,
                    request.CustomerNote,
                    request.Quantity,
                    refundAmount,
                    _rmaCodeGenerator.Generate());

                foreach (var evidence in request.EvidenceFiles)
                {
                    returnRequest.AddEvidence(evidence.FileUrl, evidence.FileType, evidence.Description);
                }

                try
                {
                    await _unitOfWork.ReturnRequests.AddAsync(returnRequest, cancellationToken);
                    await _unitOfWork.CompleteAsync(cancellationToken);

                    await _logger.LogAsync(
                        ELogLevel.Information,
                        "Created return request {ReturnRequestCode} for order {OrderCode}",
                        "CreateReturnRequest",
                        properties: new Dictionary<string, object?>
                        {
                            { "ReturnRequestId", returnRequest.Id },
                            { "ReturnRequestCode", returnRequest.Code },
                            { "OrderId", order.Id },
                            { "OrderCode", order.Code }
                        });

                    return Result<Guid>.Success(returnRequest.Id);
                }
                catch (DbUpdateException ex) when (IsUniqueCodeViolation(ex) && attempt < 3)
                {
                    _unitOfWork.ClearTracking();
                }
                catch (DbUpdateException ex) when (IsUniqueCodeViolation(ex))
                {
                    _unitOfWork.ClearTracking();
                    return Result<Guid>.Conflict("Mã RMA đã tồn tại, vui lòng thử lại.");
                }
            }

            return Result<Guid>.Conflict("Mã RMA đã tồn tại, vui lòng thử lại.");
        }

        private static bool IsUniqueCodeViolation(DbUpdateException exception)
        {
            var message = exception.InnerException?.Message ?? exception.Message;
            return message.Contains("IX_ReturnRequests_Code", StringComparison.OrdinalIgnoreCase)
                   || (message.Contains("ReturnRequests", StringComparison.OrdinalIgnoreCase)
                       && message.Contains("Code", StringComparison.OrdinalIgnoreCase)
                       && (message.Contains("unique", StringComparison.OrdinalIgnoreCase)
                           || message.Contains("duplicate", StringComparison.OrdinalIgnoreCase)));
        }
    }
}

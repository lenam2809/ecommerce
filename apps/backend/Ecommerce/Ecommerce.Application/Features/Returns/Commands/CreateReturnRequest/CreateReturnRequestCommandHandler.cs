using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Domain.Interfaces.Logging;
using MediatR;

namespace Ecommerce.Application.Features.Returns.Commands.CreateReturnRequest
{
    public class CreateReturnRequestCommandHandler
        : IRequestHandler<CreateReturnRequestCommand, Result<Guid>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IEnhancedLogger _logger;

        public CreateReturnRequestCommandHandler(IUnitOfWork unitOfWork, IEnhancedLogger logger)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        public async Task<Result<Guid>> Handle(
            CreateReturnRequestCommand request, CancellationToken cancellationToken)
        {
            var order = await _unitOfWork.Orders.GetByIdAsync(request.OrderId, cancellationToken);
            if (order is null)
            {
                return Result<Guid>.NotFound("Đơn hàng không tồn tại.");
            }

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

            var refundAmount = orderItem.UnitPrice * request.Quantity;
            var returnRequest = ReturnRequest.Create(
                request.OrderId,
                request.OrderItemId,
                request.CustomerId,
                request.Type,
                request.Reason,
                request.CustomerNote,
                request.Quantity,
                refundAmount);

            foreach (var evidence in request.EvidenceFiles)
            {
                returnRequest.AddEvidence(evidence.FileUrl, evidence.FileType, evidence.Description);
            }

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
    }
}

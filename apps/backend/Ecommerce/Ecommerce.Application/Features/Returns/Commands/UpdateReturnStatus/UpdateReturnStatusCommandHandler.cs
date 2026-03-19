using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Domain.Interfaces.Logging;
using MediatR;

namespace Ecommerce.Application.Features.Returns.Commands.UpdateReturnStatus
{
    public class UpdateReturnStatusCommandHandler
        : IRequestHandler<UpdateReturnStatusCommand, Result<bool>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IEnhancedLogger _logger;

        public UpdateReturnStatusCommandHandler(IUnitOfWork unitOfWork, IEnhancedLogger logger)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        public async Task<Result<bool>> Handle(
            UpdateReturnStatusCommand request, CancellationToken cancellationToken)
        {
            var returnRequest = await _unitOfWork.ReturnRequests
                .GetWithDetailsAsync(request.ReturnRequestId, cancellationToken);

            if (returnRequest is null)
                return Result<bool>.NotFound("Yêu cầu đổi/trả không tồn tại.");

            try
            {
                switch (request.NewStatus)
                {
                    case EReturnStatus.UnderReview:
                        // Cần StaffId - lấy từ context (giả sử truyền qua Note tạm)
                        returnRequest.StartReview(Guid.Empty);
                        break;
                    case EReturnStatus.ItemReceived:
                        returnRequest.ConfirmItemReceived(request.Note);
                        break;
                    case EReturnStatus.QualityCheck:
                        returnRequest.StartQualityCheck(request.Note);
                        break;
                    case EReturnStatus.RefundProcessing:
                        returnRequest.StartRefundProcessing(request.Note);
                        break;
                    case EReturnStatus.ExchangeProcessing:
                        returnRequest.StartExchangeProcessing(request.Note);
                        break;
                    case EReturnStatus.Completed:
                        returnRequest.MarkCompleted(request.Note);
                        break;
                    default:
                        return Result<bool>.BadRequest(
                            $"Không thể chuyển sang trạng thái '{request.NewStatus}' bằng lệnh này.");
                }
            }
            catch (Exception ex)
            {
                return Result<bool>.BadRequest(ex.Message);
            }

            await _unitOfWork.CompleteAsync(cancellationToken);

            await _logger.LogAsync(ELogLevel.Information,
                $"Cập nhật trạng thái RMA {returnRequest.Code} → {request.NewStatus}",
                "Cập nhật trạng thái RMA");

            return Result<bool>.Success(true);
        }
    }
}

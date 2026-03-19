using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Domain.Interfaces.Logging;
using MediatR;

namespace Ecommerce.Application.Features.Returns.Commands.RejectReturn
{
    public class RejectReturnCommandHandler
        : IRequestHandler<RejectReturnCommand, Result<bool>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IEnhancedLogger _logger;

        public RejectReturnCommandHandler(IUnitOfWork unitOfWork, IEnhancedLogger logger)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        public async Task<Result<bool>> Handle(
            RejectReturnCommand request, CancellationToken cancellationToken)
        {
            var returnRequest = await _unitOfWork.ReturnRequests
                .GetWithDetailsAsync(request.ReturnRequestId, cancellationToken);

            if (returnRequest is null)
                return Result<bool>.NotFound("Yêu cầu đổi/trả không tồn tại.");

            try
            {
                returnRequest.Reject(request.StaffId, request.RejectionReason);
            }
            catch (Exception ex)
            {
                return Result<bool>.BadRequest(ex.Message);
            }

            await _unitOfWork.CompleteAsync(cancellationToken);

            await _logger.LogAsync(ELogLevel.Information,
                $"Yêu cầu đổi/trả {returnRequest.Code} đã bị từ chối. Lý do: {request.RejectionReason}",
                "Từ chối đổi/trả");

            return Result<bool>.Success(true);
        }
    }
}

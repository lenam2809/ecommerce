using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Domain.Interfaces.Logging;
using MediatR;

namespace Ecommerce.Application.Features.Returns.Commands.ApproveReturn
{
    public class ApproveReturnCommandHandler
        : IRequestHandler<ApproveReturnCommand, Result<bool>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IEnhancedLogger _logger;

        public ApproveReturnCommandHandler(IUnitOfWork unitOfWork, IEnhancedLogger logger)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        public async Task<Result<bool>> Handle(
            ApproveReturnCommand request, CancellationToken cancellationToken)
        {
            var returnRequest = await _unitOfWork.ReturnRequests
                .GetWithDetailsAsync(request.ReturnRequestId, cancellationToken);

            if (returnRequest is null)
                return Result<bool>.NotFound("Yêu cầu đổi/trả không tồn tại.");

            try
            {
                returnRequest.Approve(request.StaffId, request.StaffNote, request.FinalRefundAmount);
            }
            catch (Exception ex)
            {
                return Result<bool>.BadRequest(ex.Message);
            }

            await _unitOfWork.CompleteAsync(cancellationToken);

            await _logger.LogAsync(ELogLevel.Information,
                $"Yêu cầu đổi/trả {returnRequest.Code} đã được duyệt bởi Staff {request.StaffId}",
                "Duyệt đổi/trả");

            return Result<bool>.Success(true);
        }
    }
}

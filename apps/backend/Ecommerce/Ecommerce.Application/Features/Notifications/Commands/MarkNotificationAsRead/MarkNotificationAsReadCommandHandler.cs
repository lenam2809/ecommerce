using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Domain.Interfaces.Logging;
using MediatR;

namespace Ecommerce.Application.Features.Notifications.Commands.MarkNotificationAsRead
{
    public class MarkNotificationAsReadCommandHandler : IRequestHandler<MarkNotificationAsReadCommand, Result<bool>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IEnhancedLogger _logger;

        public MarkNotificationAsReadCommandHandler(IUnitOfWork unitOfWork, IEnhancedLogger logger)
        {
            _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<Result<bool>> Handle(MarkNotificationAsReadCommand request, CancellationToken cancellationToken)
        {
            try
            {
                // Lấy notification để kiểm tra quyền sở hữu
                var notification = await _unitOfWork.Notifications.GetByIdAsync(request.NotificationId, cancellationToken);

                if (notification == null)
                {
                    return Result<bool>.NotFound("Thông báo không tồn tại");
                }

                // Kiểm tra quyền sở hữu (chỉ người nhận mới có thể đánh dấu đã đọc)
                if (notification.RecipientId != request.UserId)
                {
                    return Result<bool>.Forbidden("Bạn không có quyền thực hiện thao tác này");
                }

                // Nếu đã đọc rồi thì không cần cập nhật
                if (notification.IsRead)
                {
                    return Result<bool>.Success(true);
                }

                // Đánh dấu đã đọc
                await _unitOfWork.Notifications.MarkAsReadAsync(request.NotificationId, cancellationToken);
                await _unitOfWork.CompleteAsync(cancellationToken);

                return Result<bool>.Success(true);
            }
            catch (Exception ex)
            {
                await _logger.LogExceptionAsync(ex, "MarkNotificationAsReadCommandHandler.Handle");
                return Result<bool>.BadRequest(ex.Message);
            }
        }
    }
}


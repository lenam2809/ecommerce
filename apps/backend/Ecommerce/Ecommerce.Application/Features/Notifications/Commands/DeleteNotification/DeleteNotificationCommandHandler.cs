using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Domain.Interfaces.Logging;
using MediatR;

namespace Ecommerce.Application.Features.Notifications.Commands.DeleteNotification
{
    public class DeleteNotificationCommandHandler : IRequestHandler<DeleteNotificationCommand, Result<bool>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IEnhancedLogger _logger;

        public DeleteNotificationCommandHandler(IUnitOfWork unitOfWork, IEnhancedLogger logger)
        {
            _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<Result<bool>> Handle(DeleteNotificationCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var notification = await _unitOfWork.Notifications.GetByIdAsync(request.NotificationId, cancellationToken);

                if (notification == null)
                {
                    return Result<bool>.NotFound("Thông báo không tồn tại");
                }

                // Kiểm tra quyền xóa
                if (notification.RecipientId != request.UserId && !request.IsAdmin)
                {
                    return Result<bool>.Forbidden("Bạn không có quyền xóa thông báo này");
                }

                _unitOfWork.Notifications.Delete(notification);
                await _unitOfWork.CompleteAsync(cancellationToken);

                return Result<bool>.Success(true);
            }
            catch (Exception ex)
            {
                await _logger.LogExceptionAsync(ex, "DeleteNotificationCommandHandler.Handle");
                return Result<bool>.BadRequest(ex.Message);
            }
        }
    }
}


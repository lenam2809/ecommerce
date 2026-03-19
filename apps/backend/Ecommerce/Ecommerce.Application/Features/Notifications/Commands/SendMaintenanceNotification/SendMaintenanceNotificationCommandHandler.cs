using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Interfaces.Logging;
using MediatR;

namespace Ecommerce.Application.Features.Notifications.Commands.SendMaintenanceNotification
{
    public class SendMaintenanceNotificationCommandHandler : IRequestHandler<SendMaintenanceNotificationCommand, Result<bool>>
    {
        private readonly INotificationService _notificationService;
        private readonly IEnhancedLogger _logger;

        public SendMaintenanceNotificationCommandHandler(
            INotificationService notificationService,
            IEnhancedLogger logger)
        {
            _notificationService = notificationService ?? throw new ArgumentNullException(nameof(notificationService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<Result<bool>> Handle(SendMaintenanceNotificationCommand request, CancellationToken cancellationToken)
        {
            try
            {

                await _notificationService.SendMaintenanceNotificationAsync(
                    request.Title,
                    request.Message,
                    request.ScheduledTime,
                    request.DurationMinutes,
                    request.ActionUrl);

                return Result<bool>.Success(true);
            }
            catch (Exception ex)
            {
                await _logger.LogExceptionAsync(ex, "SendMaintenanceNotificationCommandHandler.Handle");
                return Result<bool>.BadRequest($"Gửi thông báo bảo trì thất bại: {ex.Message}");
            }
        }
    }
}


using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Interfaces.Logging;
using MediatR;

namespace Ecommerce.Application.Features.Notifications.Commands.SendPromotionNotification
{
    public class SendPromotionNotificationCommandHandler : IRequestHandler<SendPromotionNotificationCommand, Result<bool>>
    {
        private readonly INotificationService _notificationService;
        private readonly IEnhancedLogger _logger;

        public SendPromotionNotificationCommandHandler(
            INotificationService notificationService,
            IEnhancedLogger logger)
        {
            _notificationService = notificationService ?? throw new ArgumentNullException(nameof(notificationService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<Result<bool>> Handle(SendPromotionNotificationCommand request, CancellationToken cancellationToken)
        {
            try
            {

                await _notificationService.SendPromotionAnnouncementAsync(
                    request.Title,
                    request.Message,
                    request.ExpiresAt,
                    request.TargetUserId,
                    request.TargetGroup,
                    request.ActionUrl,
                    request.ImageUrl);


                return Result<bool>.Success(true);
            }
            catch (Exception ex)
            {
                await _logger.LogExceptionAsync(ex, "SendPromotionNotificationCommandHandler.Handle");
                return Result<bool>.BadRequest($"Gửi thông báo khuyến mãi thất bại: {ex.Message}");
            }
        }
    }
}


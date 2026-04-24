using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Domain.Events;
using Ecommerce.Domain.Interfaces.Logging;
using MediatR;

namespace Ecommerce.Application.Features.Auth.EventHandlers
{
    public class UserLockedEventHandler : INotificationHandler<UserLockedEvent>
    {
        private readonly IEnhancedLogger _logger;
        private readonly INotificationService _notificationService;

        public UserLockedEventHandler(IEnhancedLogger logger, INotificationService notificationService)
        {
            _logger = logger;
            _notificationService = notificationService;
        }

        public async Task Handle(UserLockedEvent notification, CancellationToken cancellationToken)
        {
            await _logger.LogAsync(Ecommerce.Domain.Enums.ELogLevel.Warning,
                "User account {UserId} was locked for reason {Reason}",
                "UserLocked",
                properties: new Dictionary<string, object?>
                {
                    { "UserId", notification.UserId },
                    { "Reason", notification.Reason },
                    { "ExpiresAt", notification.ExpiresAt }
                });

            // Ví dụ: Gửi email thông báo cho người dùng
            // await _notificationService.SendEmailAsync(notification.UserEmail, "Tài khoản bị khóa", $"Tài khoản của bạn đã bị khóa vì: {notification.Reason}");
        }
    }
}

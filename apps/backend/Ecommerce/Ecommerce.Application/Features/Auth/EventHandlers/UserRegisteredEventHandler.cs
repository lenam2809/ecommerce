using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Domain.Events;
using MediatR;

namespace Ecommerce.Application.Features.Auth.EventHandlers
{
    /// <summary>
    /// Handler for UserRegisteredEvent to send real-time notifications
    /// </summary>
    public class UserRegisteredEventHandler : INotificationHandler<UserRegisteredEvent>
    {
        private readonly INotificationService _notificationService;

        public UserRegisteredEventHandler(INotificationService notificationService)
        {
            _notificationService = notificationService;
        }

        public async Task Handle(UserRegisteredEvent notification, CancellationToken cancellationToken)
        {
            // Create a notification payload
            var payload = new
            {
                notification.UserId,
                notification.Email,
                notification.FirstName,
                notification.LastName,
                notification.Role,
                Timestamp = DateTime.Now
            };

            // Send notification to administrators group
            await _notificationService.SendNotificationToGroupAsync(
                "Administrators",
                "UserRegistered",
                payload,
                cancellationToken);
        }
    }
}


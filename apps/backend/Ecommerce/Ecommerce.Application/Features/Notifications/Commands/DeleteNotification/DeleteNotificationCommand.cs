using Ecommerce.Application.Common.Models;
using MediatR;

namespace Ecommerce.Application.Features.Notifications.Commands.DeleteNotification
{
    public class DeleteNotificationCommand : IRequest<Result<bool>>
    {
        public Guid NotificationId { get; set; }
        public Guid UserId { get; set; }
        public bool IsAdmin { get; set; }
    }
}


using Ecommerce.Application.Common.Models;
using MediatR;

namespace Ecommerce.Application.Features.Notifications.Commands.MarkNotificationAsRead
{
    public class MarkNotificationAsReadCommand : IRequest<Result<bool>>
    {
        public Guid NotificationId { get; set; }
        public Guid UserId { get; set; }
    }
}


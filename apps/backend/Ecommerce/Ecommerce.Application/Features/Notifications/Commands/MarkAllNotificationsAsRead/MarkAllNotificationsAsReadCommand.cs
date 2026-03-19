using Ecommerce.Application.Common.Models;
using MediatR;

namespace Ecommerce.Application.Features.Notifications.Commands.MarkAllNotificationsAsRead
{
    public class MarkAllNotificationsAsReadCommand : IRequest<Result<bool>>
    {
        public Guid UserId { get; set; }
    }
}


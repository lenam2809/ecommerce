using Ecommerce.Application.Common.Models;
using MediatR;

namespace Ecommerce.Application.Features.Notifications.Commands.SendMaintenanceNotification
{
    public class SendMaintenanceNotificationCommand : IRequest<Result<bool>>
    {
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public DateTime ScheduledTime { get; set; }
        public int DurationMinutes { get; set; }
        public string? ActionUrl { get; set; }
    }
}


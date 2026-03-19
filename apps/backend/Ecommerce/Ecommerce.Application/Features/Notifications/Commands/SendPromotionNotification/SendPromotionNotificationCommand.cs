using Ecommerce.Application.Common.Models;
using MediatR;

namespace Ecommerce.Application.Features.Notifications.Commands.SendPromotionNotification
{
    public class SendPromotionNotificationCommand : IRequest<Result<bool>>
    {
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public DateTime? ExpiresAt { get; set; }
        public Guid? TargetUserId { get; set; }
        public string? TargetGroup { get; set; }
        public string? ActionUrl { get; set; }
        public string? ImageUrl { get; set; }
    }
}


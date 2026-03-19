using Ecommerce.Application.Common.Mappings;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;
using AutoMapper;

namespace Ecommerce.Application.Features.Notifications.Dto
{
    public class NotificationDto : IMapFrom<Notification>
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public ENotificationCategory Category { get; set; }
        public string Type { get; set; } = string.Empty;
        public bool IsRead { get; set; }
        public Guid RecipientId { get; set; }
        public string? ActionUrl { get; set; }
        public string? ImageUrl { get; set; }
        public DateTime? ExpiresAt { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ReadAt { get; set; }

        public void Mapping(Profile profile)
        {
            profile.CreateMap<Notification, NotificationDto>();
        }
    }
}


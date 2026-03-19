using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Notifications.Dto;
using Ecommerce.Domain.Enums;
using MediatR;

namespace Ecommerce.Application.Features.Notifications.Queries.GetUserNotifications
{
    public class GetUserNotificationsQuery : IRequest<Result<PaginatedList<NotificationDto>>>
    {
        public Guid UserId { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 20;
        public bool? IsRead { get; set; }
        public ENotificationCategory? Category { get; set; }
        public string SortBy { get; set; } = "createdAt";
        public bool IsDescending { get; set; } = true;
    }
}


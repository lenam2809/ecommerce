using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Notifications.Dto;
using MediatR;

namespace Ecommerce.Application.Features.Notifications.Queries.GetSystemNotifications
{
    public class GetSystemNotificationsQuery : IRequest<Result<PaginatedList<NotificationDto>>>
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 20;
        public bool IncludeExpired { get; set; } = false;
        public string SortBy { get; set; } = "createdAt";
        public bool IsDescending { get; set; } = true;
    }
}


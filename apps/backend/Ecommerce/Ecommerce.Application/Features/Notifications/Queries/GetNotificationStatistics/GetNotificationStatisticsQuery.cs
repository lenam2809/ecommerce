using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Notifications.Dto;
using MediatR;

namespace Ecommerce.Application.Features.Notifications.Queries.GetNotificationStatistics
{
    public class GetNotificationStatisticsQuery : IRequest<Result<NotificationStatisticsDto>>
    {
        public Guid? UserId { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
    }
}


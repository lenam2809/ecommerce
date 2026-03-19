using Ecommerce.Application.Common.Models;
using MediatR;

namespace Ecommerce.Application.Features.Notifications.Queries.GetUnreadNotificationCount
{
    public class GetUnreadNotificationCountQuery : IRequest<Result<int>>
    {
        public Guid UserId { get; set; }
    }
}


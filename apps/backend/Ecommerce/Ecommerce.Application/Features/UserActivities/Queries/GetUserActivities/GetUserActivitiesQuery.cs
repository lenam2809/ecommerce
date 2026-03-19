using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.UserActivities.Dto;
using MediatR;

namespace Ecommerce.Application.Features.UserActivities.Queries.GetUserActivities
{
    public class GetUserActivitiesQuery : IRequest<Result<PaginatedList<UserActivityDto>>>
    {
        public Guid? UserId { get; set; } // Null = current user, Admin có thể xem user khác
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 20;
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string ActivityType { get; set; } = string.Empty;
        public string SearchTerm { get; set; } = string.Empty;
        public string SortBy { get; set; } = "Timestamp";
        public bool IsDescending { get; set; } = true;
    }
}


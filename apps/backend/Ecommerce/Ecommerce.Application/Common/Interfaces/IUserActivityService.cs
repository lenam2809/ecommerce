using Ecommerce.Application.Features.UserActivities.Dto;

namespace Ecommerce.Application.Common.Interfaces
{
    public interface IUserActivityService
    {
        Task LogActivityAsync(string activityType, string? description = null, object? additionalData = null, Guid? userId = null);
        Task<IEnumerable<UserActivityDto>> GetRecentActivitiesAsync(int count = 10);
        Task<IEnumerable<UserActivityDto>> GetUserActivitiesAsync(Guid userId, DateTime? from = null, DateTime? to = null);
    }
}


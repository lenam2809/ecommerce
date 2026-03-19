using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces.Base;

namespace Ecommerce.Domain.Interfaces
{
    public interface IUserActivityRepository : IRepository<UserActivity>
    {
        Task<IEnumerable<UserActivity>> GetRecentActivitiesByUserAsync(Guid userId, int count = 10);
        Task<IEnumerable<UserActivity>> GetActivitiesByUserAsync(Guid userId, DateTime? from = null, DateTime? to = null);
        Task<IEnumerable<UserActivity>> GetActivitiesByTypeAsync(string activityType, DateTime? from = null, DateTime? to = null);
        Task LogActivityAsync(Guid userId, string activityType, string description, string? ipAddress = null, string? userAgent = null, object? additionalData = null);
    }
}


using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Infrastructure.Persistence.Repositories.Base;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace Ecommerce.Infrastructure.Persistence.Repositories
{
    public class UserActivityRepository : BaseRepository<UserActivity>, IUserActivityRepository
    {
        public UserActivityRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<UserActivity>> GetRecentActivitiesByUserAsync(Guid userId, int count = 10)
        {
            return await _context.UserActivities
                .Where(ua => ua.UserId == userId)
                .OrderByDescending(ua => ua.Timestamp)
                .Take(count)
                .Include(ua => ua.User)
                .ToListAsync();
        }

        public async Task<IEnumerable<UserActivity>> GetActivitiesByUserAsync(Guid userId, DateTime? from = null, DateTime? to = null)
        {
            var query = _context.UserActivities.Where(ua => ua.UserId == userId);

            if (from.HasValue)
                query = query.Where(ua => ua.Timestamp >= from.Value);

            if (to.HasValue)
                query = query.Where(ua => ua.Timestamp <= to.Value);

            return await query
                .OrderByDescending(ua => ua.Timestamp)
                .Include(ua => ua.User)
                .ToListAsync();
        }

        public async Task<IEnumerable<UserActivity>> GetActivitiesByTypeAsync(string activityType, DateTime? from = null, DateTime? to = null)
        {
            var query = _context.UserActivities.Where(ua => ua.ActivityType == activityType);

            if (from.HasValue)
                query = query.Where(ua => ua.Timestamp >= from.Value);

            if (to.HasValue)
                query = query.Where(ua => ua.Timestamp <= to.Value);

            return await query
                .OrderByDescending(ua => ua.Timestamp)
                .Include(ua => ua.User)
                .ToListAsync();
        }

        public async Task LogActivityAsync(Guid userId, string activityType, string description, string ipAddress = null, string userAgent = null, object additionalData = null)
        {
            var activity = new UserActivity
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                ActivityType = activityType,
                Description = description ?? activityType,
                IpAddress = ipAddress,
                UserAgent = userAgent,
                Location = "Không xác định", // Có thể sử dụng dịch vụ GeoIP để lấy vị trí nếu cần
                Timestamp = DateTime.Now,
                AdditionalData = additionalData != null ? JsonSerializer.Serialize(additionalData) : null
            };

            await _context.UserActivities.AddAsync(activity);
            // Note: SaveChanges sẽ được gọi ở UnitOfWork level
        }
    }
}


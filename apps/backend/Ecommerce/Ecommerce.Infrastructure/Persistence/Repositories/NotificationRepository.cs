using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Infrastructure.Persistence.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Infrastructure.Persistence.Repositories
{
    public class NotificationRepository : BaseRepository<Notification>, INotificationRepository
    {
        public NotificationRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<List<Notification>> GetUnreadNotificationsAsync(Guid userId, CancellationToken cancellationToken = default)
        {
            return await _context.Notifications
                .Where(n => (n.RecipientId == userId || n.RecipientId == null) &&
                           !n.IsRead &&
                           (n.ExpiresAt == null || n.ExpiresAt > DateTime.Now))
                .Include(n => n.Sender)
                .OrderByDescending(n => n.CreatedAt)
                .AsNoTracking()
                .ToListAsync(cancellationToken);
        }

        public async Task<(List<Notification> Notifications, int TotalCount)> GetUserNotificationsAsync(
            Guid userId,
        int page,
        int pageSize,
            bool? isRead = null,
            ENotificationCategory? category = null,
            CancellationToken cancellationToken = default)
        {
            var query = _context.Notifications
                .Where(n => n.RecipientId == userId || n.RecipientId == null)
                .Where(n => n.ExpiresAt == null || n.ExpiresAt > DateTime.Now);

            if (isRead.HasValue)
                query = query.Where(n => n.IsRead == isRead.Value);

            if (category.HasValue)
                query = query.Where(n => n.Category == category.Value);

            var totalCount = await query.CountAsync(cancellationToken);

            var notifications = await query
                .Include(n => n.Sender)
                .OrderByDescending(n => n.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .AsNoTracking()
                .ToListAsync(cancellationToken);

            return (notifications, totalCount);
        }

        public async Task MarkAsReadAsync(Guid notificationId, CancellationToken cancellationToken = default)
        {
            var notification = await _context.Notifications
                .FirstOrDefaultAsync(n => n.Id == notificationId, cancellationToken);

            if (notification != null && !notification.IsRead)
            {
                notification.IsRead = true;
                notification.ReadAt = DateTime.Now;
                notification.UpdatedAt = DateTime.Now;
                await _context.SaveChangesAsync(cancellationToken);
            }
        }

        public async Task MarkAllAsReadAsync(Guid userId, CancellationToken cancellationToken = default)
        {
            await _context.Notifications
                .Where(n => (n.RecipientId == userId || n.RecipientId == null) && !n.IsRead)
                .ExecuteUpdateAsync(n => n
                    .SetProperty(x => x.IsRead, true)
                    .SetProperty(x => x.ReadAt, DateTime.Now)
                    .SetProperty(x => x.UpdatedAt, DateTime.Now),
                    cancellationToken);
        }

        public async Task<int> CountUnreadNotificationsAsync(Guid userId, CancellationToken cancellationToken = default)
        {
            return await _context.Notifications
                .CountAsync(n => (n.RecipientId == userId || n.RecipientId == null) &&
                               !n.IsRead &&
                               (n.ExpiresAt == null || n.ExpiresAt > DateTime.Now),
                               cancellationToken);
        }

        public async Task<List<Notification>> GetSystemNotificationsAsync(
        int page,
            int pageSize,
            bool includeExpired = false,
            CancellationToken cancellationToken = default)
        {
            var query = _context.Notifications
                .Where(n => n.RecipientId == null);

            if (!includeExpired)
                query = query.Where(n => n.ExpiresAt == null || n.ExpiresAt > DateTime.Now);

            return await query
                .Include(n => n.Sender)
                .OrderByDescending(n => n.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .AsNoTracking()
                .ToListAsync(cancellationToken);
        }

        public async Task<List<Notification>> GetGroupNotificationsAsync(
            string groupName,
            int page,
            int pageSize,
            CancellationToken cancellationToken = default)
        {
            return await _context.Notifications
                .Where(n => n.TargetGroup == groupName &&
                           (n.ExpiresAt == null || n.ExpiresAt > DateTime.Now))
                .Include(n => n.Sender)
                .OrderByDescending(n => n.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .AsNoTracking()
                .ToListAsync(cancellationToken);
        }

        public async Task DeleteExpiredNotificationsAsync(CancellationToken cancellationToken = default)
        {
            await _context.Notifications
                .Where(n => n.ExpiresAt != null && n.ExpiresAt <= DateTime.Now)
                .ExecuteDeleteAsync(cancellationToken);
        }

        public async Task<List<Notification>> GetPendingRealtimeNotificationsAsync(
            int batchSize = 100,
            CancellationToken cancellationToken = default)
        {
            return await _context.Notifications
                .Where(n => !n.IsSentRealtime && n.RetryCount < 3)
                .OrderBy(n => n.CreatedAt)
                .Take(batchSize)
                .ToListAsync(cancellationToken);
        }

        public async Task<List<Notification>> GetPendingEmailNotificationsAsync(
            int batchSize = 100,
            CancellationToken cancellationToken = default)
        {
            return await _context.Notifications
                .Where(n => !n.IsSentEmail && n.RetryCount < 3)
                .Include(n => n.Recipient)
                .OrderBy(n => n.CreatedAt)
                .Take(batchSize)
                .ToListAsync(cancellationToken);
        }

        public async Task UpdateDeliveryStatusAsync(
            Guid notificationId,
            bool isSentRealtime = false,
            bool isSentEmail = false,
            string? error = null,
            CancellationToken cancellationToken = default)
        {
            var notification = await GetByIdAsync(notificationId, cancellationToken);
            if (notification != null)
            {
                if (isSentRealtime)
                    notification.IsSentRealtime = true;

                if (isSentEmail)
                    notification.IsSentEmail = true;

                if (!string.IsNullOrEmpty(error))
                {
                    notification.LastError = error;
                    notification.RetryCount++;
                }

                notification.UpdatedAt = DateTime.Now;
                Update(notification);
            }
        }

        public async Task<Dictionary<ENotificationCategory, int>> GetNotificationStatisticsAsync(
        Guid? userId = null,
            DateTime? fromDate = null,
            DateTime? toDate = null,
            CancellationToken cancellationToken = default)
        {
            var query = _context.Notifications.AsQueryable();

            if (userId.HasValue)
                query = query.Where(n => n.RecipientId == userId || n.RecipientId == null);

            if (fromDate.HasValue)
                query = query.Where(n => n.CreatedAt >= fromDate.Value);

            if (toDate.HasValue)
                query = query.Where(n => n.CreatedAt <= toDate.Value);

            return await query
                .GroupBy(n => n.Category)
                .ToDictionaryAsync(
                    g => g.Key,
                    g => g.Count(),
                    cancellationToken);
        }
    }
}


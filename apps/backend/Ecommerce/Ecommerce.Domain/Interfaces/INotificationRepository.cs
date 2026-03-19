using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces.Base;

namespace Ecommerce.Domain.Interfaces
{
    public interface INotificationRepository : IRepository<Notification>
    {
        /// <summary>
        /// Lấy thông báo chưa đọc của user
        /// </summary>
        Task<List<Notification>> GetUnreadNotificationsAsync(Guid userId, CancellationToken cancellationToken = default);

        /// <summary>
        /// Lấy thông báo theo user với phân trang
        /// </summary>
        Task<(List<Notification> Notifications, int TotalCount)> GetUserNotificationsAsync(
            Guid userId,
            int page,
            int pageSize,
            bool? isRead = null,
            ENotificationCategory? category = null,
            CancellationToken cancellationToken = default);

        /// <summary>
        /// Đánh dấu thông báo đã đọc
        /// </summary>
        Task MarkAsReadAsync(Guid notificationId, CancellationToken cancellationToken = default);

        /// <summary>
        /// Đánh dấu tất cả thông báo của user đã đọc
        /// </summary>
        Task MarkAllAsReadAsync(Guid userId, CancellationToken cancellationToken = default);

        /// <summary>
        /// Đếm số thông báo chưa đọc
        /// </summary>
        Task<int> CountUnreadNotificationsAsync(Guid userId, CancellationToken cancellationToken = default);

        /// <summary>
        /// Lấy thông báo hệ thống (gửi cho tất cả)
        /// </summary>
        Task<List<Notification>> GetSystemNotificationsAsync(
            int page,
            int pageSize,
            bool includeExpired = false,
            CancellationToken cancellationToken = default);

        /// <summary>
        /// Lấy thông báo theo nhóm
        /// </summary>
        Task<List<Notification>> GetGroupNotificationsAsync(
            string groupName,
            int page,
            int pageSize,
            CancellationToken cancellationToken = default);

        /// <summary>
        /// Xóa thông báo đã hết hạn
        /// </summary>
        Task DeleteExpiredNotificationsAsync(CancellationToken cancellationToken = default);

        /// <summary>
        /// Lấy thông báo chưa gửi realtime
        /// </summary>
        Task<List<Notification>> GetPendingRealtimeNotificationsAsync(
            int batchSize = 100,
            CancellationToken cancellationToken = default);

        /// <summary>
        /// Lấy thông báo chưa gửi email
        /// </summary>
        Task<List<Notification>> GetPendingEmailNotificationsAsync(
            int batchSize = 100,
            CancellationToken cancellationToken = default);

        /// <summary>
        /// Cập nhật trạng thái gửi
        /// </summary>
        Task UpdateDeliveryStatusAsync(
            Guid notificationId,
            bool isSentRealtime = false,
            bool isSentEmail = false,
            string? error = null,
            CancellationToken cancellationToken = default);

        /// <summary>
        /// Lấy thống kê thông báo
        /// </summary>
        Task<Dictionary<ENotificationCategory, int>> GetNotificationStatisticsAsync(
            Guid? userId = null,
            DateTime? fromDate = null,
            DateTime? toDate = null,
            CancellationToken cancellationToken = default);
    }
}


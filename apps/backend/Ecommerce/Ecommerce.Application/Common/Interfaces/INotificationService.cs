using Ecommerce.Application.Features.Reviews.Dto;
using Ecommerce.Domain.Enums;

namespace Ecommerce.Application.Common.Interfaces
{
    public interface INotificationService
    {
        /// <summary>
        /// Gửi thông báo cho người dùng khi trạng thái đơn hàng thay đổi
        /// </summary>
        /// <param name="userId">ID của người dùng nhận thông báo</param>
        /// <param name="orderId">ID của đơn hàng</param>
        /// <param name="oldStatus">Trạng thái cũ của đơn hàng</param>
        /// <param name="newStatus">Trạng thái mới của đơn hàng</param>
        Task SendOrderStatusNotificationAsync(Guid? userId, Guid orderId, EOrderStatus oldStatus, EOrderStatus newStatus);

        /// <summary>
        /// Gửi email xác nhận đơn hàng cho khách hàng
        /// </summary>
        /// <param name="orderId">ID của đơn hàng</param>
        Task SendOrderConfirmationEmailAsync(Guid orderId);

        /// <summary>
        /// Gửi thông báo đơn hàng cho admin hoặc nhân viên
        /// </summary>
        /// <param name="orderId">ID của đơn hàng</param>
        /// <param name="notificationType">Loại thông báo</param>
        Task SendAdminNotificationAsync(Guid orderId, string notificationType);

        /// <summary>
        /// Gửi thông báo đơn hàng mới tới quản trị viên
        /// </summary>
        /// <param name="orderId">ID của đơn hàng</param>
        /// <param name="orderCode">Mã đơn hàng</param>
        /// <param name="customerName">Tên khách hàng</param>
        /// <param name="totalAmount">Tổng tiền</param>
        /// <param name="itemCount">Số lượng sản phẩm</param>
        Task SendNewOrderNotificationAsync(Guid orderId, string orderCode, string customerName, decimal totalAmount, int itemCount);

        /// <summary>
        /// Gửi thông báo khuyến mãi đến người dùng
        /// </summary>
        /// <param name="userId">ID của người dùng</param>
        /// <param name="promotionId">ID của khuyến mãi</param>
        Task SendPromotionNotificationAsync(Guid userId, Guid promotionId);

        /// <summary>
        /// Gửi thông báo cập nhật cấp độ khách hàng
        /// </summary>
        /// <param name="userId">ID của người dùng</param>
        /// <param name="oldLevel">Cấp độ cũ</param>
        /// <param name="newLevel">Cấp độ mới</param>
        Task SendCustomerLevelUpgradeNotificationAsync(Guid userId, ECustomerLevel oldLevel, ECustomerLevel newLevel);

        /// <summary>
        /// Gửi thông báo đến tất cả các máy khách được kết nối
        /// </summary>
        Task SendNotificationToAllAsync(string notificationType, object payload, CancellationToken cancellationToken = default);

        /// <summary>
        /// Gửi thông báo tới người dùng cụ thể
        /// </summary>
        Task SendNotificationToUserAsync(string userId, string notificationType, object payload, CancellationToken cancellationToken = default);

        /// <summary>
        /// Gửi thông báo đến nhóm cụ thể
        /// </summary>
        Task SendNotificationToGroupAsync(string groupName, string notificationType, object payload, CancellationToken cancellationToken = default);

        /// <summary>
        /// Broadcast review mới qua SignalR
        /// </summary>
        Task SendReviewNotificationAsync(Guid productId, object payload, CancellationToken cancellationToken = default);

        /// <summary>
        /// Broadcast cập nhật rating
        /// </summary>
        Task SendRatingNotificationAsync(Guid productId, double newRating, int reviewCount, CancellationToken cancellationToken = default);

        /// <summary>
        /// Broadcast cập nhật like qua SignalR
        /// </summary>
        Task SendReviewLikeUpdateNotificationAsync(Guid productId, Guid reviewId, int likeCount, CancellationToken cancellationToken = default);


        Task SendReviewReplyNotificationAsync(Guid reviewId, ReviewReplyDto replyDto, CancellationToken cancellationToken = default);

        Task SendPromotionAnnouncementAsync(
            string title,
            string message,
            DateTime? expiresAt = null,
            Guid? targetUserId = null,
            string? targetGroup = null,
            string? actionUrl = null,
            string? imageUrl = null);

        Task SendMaintenanceNotificationAsync(
            string title,
            string message,
            DateTime scheduledTime,
            int durationMinutes,
            string? actionUrl = null);

    }
}

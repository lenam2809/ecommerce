using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Features.Reviews.Dto;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Infrastructure.SignalR;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using System.Text.Json;

namespace Ecommerce.Infrastructure.Services
{
    /// <summary>
    /// Triển khai dịch vụ thông báo bằng SignalR
    /// </summary>
    public class NotificationService : INotificationService
    {
        private readonly IHubContext<NotificationHub> _hubContext;
        private readonly IHubContext<ReviewHub> _reviewHubContext;
        private readonly INotificationRepository _notificationRepository;
        private readonly ILogger<NotificationService> _logger;


        public NotificationService(IHubContext<NotificationHub> hubContext,
            IHubContext<ReviewHub> reviewHubContext,
            INotificationRepository notificationRepository,
            ILogger<NotificationService> logger)
        {
            _hubContext = hubContext;
            _reviewHubContext = reviewHubContext;
            _notificationRepository = notificationRepository;
            _logger = logger;

        }

        public async Task SendNotificationToAllAsync(string notificationType, object payload, CancellationToken cancellationToken = default)
        {
            try
            {
                // Lưu vào database
                var notification = new Notification
                {
                    Title = GetNotificationTitle(notificationType, payload),
                    Message = GetNotificationMessage(notificationType, payload),
                    Type = notificationType,
                    Category = GetNotificationCategory(notificationType),
                    Priority = GetNotificationPriority(notificationType),
                    RecipientId = null, // Gửi cho tất cả
                    Metadata = JsonSerializer.Serialize(payload),
                    IsSentRealtime = false,
                    IsSentEmail = false
                };

                await _notificationRepository.AddAsync(notification, cancellationToken);
                await _notificationRepository.SaveChangesAsync(cancellationToken);
                await _hubContext.Clients.All.SendAsync("ReceiveNotification", notificationType, payload, cancellationToken);

                // Cập nhật trạng thái đã gửi realtime
                await _notificationRepository.UpdateDeliveryStatusAsync(notification.Id, isSentRealtime: true, cancellationToken: cancellationToken);
                await _notificationRepository.SaveChangesAsync(cancellationToken);
                _logger.LogInformation("Sent notification to all users: {Type}", notificationType);

            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending notification to all clients");
                throw; // Ném lại ngoại lệ để xử lý ở nơi khác nếu cần
            }
        }

        public async Task SendNotificationToUserAsync(string userId, string notificationType, object payload, CancellationToken cancellationToken = default)
        {
            try
            {
                if (!Guid.TryParse(userId, out var userGuid))
                {
                    _logger.LogWarning("Invalid userId format: {UserId}", userId);
                    return;
                }

                // Lưu vào database
                var notification = new Notification
                {
                    Title = GetNotificationTitle(notificationType, payload),
                    Message = GetNotificationMessage(notificationType, payload),
                    Type = notificationType,
                    Category = GetNotificationCategory(notificationType),
                    Priority = GetNotificationPriority(notificationType),
                    RecipientId = userGuid,
                    Metadata = JsonSerializer.Serialize(payload),
                    IsSentRealtime = false,
                    IsSentEmail = false
                };

                await _notificationRepository.AddAsync(notification, cancellationToken);
                await _notificationRepository.SaveChangesAsync(cancellationToken);
                // Gửi qua SignalR
                await _hubContext.Clients.User(userId).SendAsync("ReceiveNotification", notificationType, payload, cancellationToken);

                // Cập nhật trạng thái đã gửi realtime
                await _notificationRepository.UpdateDeliveryStatusAsync(notification.Id, isSentRealtime: true, cancellationToken: cancellationToken);
                await _notificationRepository.SaveChangesAsync(cancellationToken);
                _logger.LogInformation("Sent notification to user {UserId}: {Type}", userId, notificationType);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send notification to user {UserId}: {Type}", userId, notificationType);

                // Cập nhật lỗi trong database nếu có notification
                // (implement retry logic here if needed)
                throw;
            }
        }

        public async Task SendNotificationToGroupAsync(string groupName, string notificationType, object payload, CancellationToken cancellationToken = default)
        {
            try
            {
                // Lưu vào database
                var notification = new Notification
                {
                    Title = GetNotificationTitle(notificationType, payload),
                    Message = GetNotificationMessage(notificationType, payload),
                    Type = notificationType,
                    Category = GetNotificationCategory(notificationType),
                    Priority = GetNotificationPriority(notificationType),
                    TargetGroup = groupName,
                    Metadata = JsonSerializer.Serialize(payload),
                    IsSentRealtime = false,
                    IsSentEmail = false
                };

                await _notificationRepository.AddAsync(notification, cancellationToken);
                await _notificationRepository.SaveChangesAsync(cancellationToken);
                // Gửi qua SignalR
                await _hubContext.Clients.Group(groupName).SendAsync("ReceiveNotification", notificationType, payload, cancellationToken);

                await _notificationRepository.UpdateDeliveryStatusAsync(notification.Id, isSentRealtime: true, cancellationToken: cancellationToken);
                await _notificationRepository.SaveChangesAsync(cancellationToken);
                _logger.LogInformation("Sent notification to all users: {Type}", notificationType);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send notification to all users: {Type}", notificationType);
                throw;
            }
        }

        public async Task SendOrderStatusNotificationAsync(Guid userId, Guid orderId, EOrderStatus oldStatus, EOrderStatus newStatus)
        {
            var payload = new
            {
                OrderId = orderId,
                OldStatus = oldStatus.ToString(),
                NewStatus = newStatus.ToString(),
                UpdatedAt = DateTime.Now
            };

            await SendNotificationToUserAsync(
                userId.ToString(),
                "OrderStatusChanged",
                payload
            );
        }

        public async Task SendOrderConfirmationEmailAsync(Guid orderId)
        {
            // Giả định phương thức này sẽ gửi email (không phải thông báo real-time)
            // Nhưng có thể kết hợp gửi cả thông báo qua SignalR

            var payload = new
            {
                OrderId = orderId,
                Message = "Đơn hàng của bạn đã được xác nhận",
                ConfirmedAt = DateTime.Now
            };

            // Gửi thông báo xác nhận đơn hàng
            await _hubContext.Clients.All.SendAsync(
                "OrderConfirmed",
                payload
            );

            // TODO: Thêm logic gửi email thực sự ở đây
        }

        public async Task SendAdminNotificationAsync(Guid orderId, string notificationType)
        {
            var payload = new
            {
                OrderId = orderId,
                NotificationType = notificationType,
                CreatedAt = DateTime.Now
            };

            // Gửi đến nhóm "Quản trị viên"
            await SendNotificationToGroupAsync(
                "Administrators",
                notificationType,
                payload
            );
        }

        public async Task SendNewOrderNotificationAsync(Guid orderId, string orderCode, string customerName, decimal totalAmount, int itemCount)
        {
            var payload = new
            {
                OrderId = orderId,
                OrderCode = orderCode,
                CustomerName = customerName,
                TotalAmount = totalAmount,
                ItemCount = itemCount,
                CreatedAt = DateTime.Now,
                Message = $"Đơn hàng mới #{orderCode} từ {customerName}",
                FormattedTotal = totalAmount.ToString("C"),
                Priority = totalAmount > 1000000 ? "Cao" : "Bình thường" // Đánh dấu ưu tiên cao cho đơn hàng lớn
            };

            // Gửi thông báo đến nhóm quản trị viên
            await SendNotificationToGroupAsync(
                "Administrators",
                "NewOrder",
                payload
            );

            // Gửi thông báo âm thanh cho đơn hàng có giá trị cao
            if (totalAmount > 1000000)
            {
                await SendNotificationToGroupAsync(
                    "Administrators",
                    "HighValueOrder",
                    payload
                );
            }
        }

        public async Task SendPromotionNotificationAsync(Guid userId, Guid promotionId)
        {
            var payload = new
            {
                PromotionId = promotionId,
                ValidFrom = DateTime.Now,
                ValidTo = DateTime.Now.AddDays(7),
                Message = "Có khuyến mãi mới dành cho bạn!"
            };

            await SendNotificationToUserAsync(userId.ToString(), "NewPromotion", payload);
        }

        public async Task SendCustomerLevelUpgradeNotificationAsync(Guid userId, ECustomerLevel oldLevel, ECustomerLevel newLevel)
        {
            var payload = new
            {
                OldLevel = oldLevel.ToString(),
                NewLevel = newLevel.ToString(),
                UpgradedAt = DateTime.Now,
                Benefits = GetLevelBenefits(newLevel) // Lấy thông tin quyền lợi tương ứng
            };

            await SendNotificationToUserAsync(
                userId.ToString(),
                "CustomerLevelUpgraded",
                payload
            );
        }

        // Phương thức hỗ trợ - Lấy thông tin quyền lợi theo cấp độ
        private static string GetLevelBenefits(ECustomerLevel level)
        {
            return level switch
            {
                ECustomerLevel.Bronze => "Quyền lợi cơ bản",
                ECustomerLevel.Silver => "Miễn phí vận chuyển, giảm giá 5%",
                ECustomerLevel.Gold => "Miễn phí vận chuyển, giảm giá 10%, hỗ trợ ưu tiên",
                ECustomerLevel.Diamond => "Miễn phí vận chuyển, giảm giá 15%, hỗ trợ VIP, truy cập sớm",
                _ => "Quyền lợi tiêu chuẩn"
            };
        }

        public async Task SendReviewNotificationAsync(Guid productId, object payload, CancellationToken cancellationToken = default)
        {
            await _reviewHubContext.Clients.Group($"product_{productId}")
                .SendAsync("NewReview", payload, cancellationToken);
        }

        public async Task SendRatingNotificationAsync(Guid productId, double newRating, int reviewCount, CancellationToken cancellationToken = default)
        {
            await _reviewHubContext.Clients.Group($"product_{productId}")
                .SendAsync("RatingUpdated", new
                {
                    ProductId = productId.ToString(),
                    NewRating = newRating,
                    ReviewCount = reviewCount
                }, cancellationToken);
        }

        // Gửi thông báo cập nhật lượt like đánh giá
        public async Task SendReviewLikeUpdateNotificationAsync(Guid productId, Guid reviewId, int likeCount, CancellationToken cancellationToken = default)
        {
            await _reviewHubContext.Clients.Group($"product_{productId}")
                .SendAsync("ReviewLikeUpdated", new
                {
                    ReviewId = reviewId,
                    LikeCount = likeCount
                }, cancellationToken);
        }

        public async Task SendReviewReplyNotificationAsync(Guid reviewId, ReviewReplyDto replyDto, CancellationToken cancellationToken = default)
        {
            await _reviewHubContext.Clients.Group($"review_{reviewId}")
                .SendAsync("NewReply", replyDto, cancellationToken);
        }

        // Phương thức hỗ trợ

        private static string GetNotificationTitle(string notificationType, object payload)
        {
            return notificationType switch
            {
                "NewOrder" => "Đơn hàng mới",
                "OrderStatusChanged" => "Trạng thái đơn hàng thay đổi",
                "OrderConfirmed" => "Đơn hàng đã xác nhận",
                "HighValueOrder" => "Đơn hàng giá trị cao",
                "NewCustomer" => "Khách hàng mới",
                "NewPromotion" => "Khuyến mãi mới",
                "CustomerLevelUpgraded" => "Nâng cấp hạng thành viên",
                "PromotionAnnouncement" => "Thông báo khuyến mãi",
                "SystemMaintenance" => "Bảo trì hệ thống",
                _ => "Thông báo"
            };
        }

        private static string GetNotificationMessage(string notificationType, object payload)
        {
            try
            {
                var jsonElement = JsonSerializer.Deserialize<JsonElement>(JsonSerializer.Serialize(payload));

                return notificationType switch
                {
                    "NewOrder" => jsonElement.TryGetProperty("Message", out var msg) ? msg.GetString() ?? "Có đơn hàng mới" : "Có đơn hàng mới",
                    "OrderStatusChanged" => "Trạng thái đơn hàng của bạn đã được cập nhật",
                    "OrderConfirmed" => "Đơn hàng của bạn đã được xác nhận",
                    "HighValueOrder" => "Có đơn hàng giá trị cao cần chú ý",
                    "NewCustomer" => jsonElement.TryGetProperty("Message", out var custMsg) ? custMsg.GetString() ?? "Có khách hàng mới đăng ký" : "Có khách hàng mới đăng ký",
                    "NewPromotion" => "Có khuyến mãi mới dành cho bạn!",
                    "CustomerLevelUpgraded" => "Chúc mừng! Hạng thành viên của bạn đã được nâng cấp",
                    "PromotionAnnouncement" => jsonElement.TryGetProperty("Message", out var promoMsg) ? promoMsg.GetString() ?? "Thông báo khuyến mãi" : "Thông báo khuyến mãi",
                    "SystemMaintenance" => "Hệ thống sẽ bảo trì trong thời gian tới",
                    _ => "Bạn có thông báo mới"
                };
            }
            catch
            {
                return "Bạn có thông báo mới";
            }
        }

        private static ENotificationCategory GetNotificationCategory(string notificationType)
        {
            return notificationType switch
            {
                "NewOrder" or "OrderStatusChanged" or "OrderConfirmed" or "HighValueOrder" => ENotificationCategory.Order,
                "NewCustomer" or "CustomerLevelUpgraded" => ENotificationCategory.Customer,
                "NewPromotion" or "PromotionAnnouncement" => ENotificationCategory.Promotion,
                "SystemMaintenance" => ENotificationCategory.Maintenance,
                _ => ENotificationCategory.System
            };
        }

        private static ENotificationPriority GetNotificationPriority(string notificationType)
        {
            return notificationType switch
            {
                "HighValueOrder" or "SystemMaintenance" => ENotificationPriority.High,
                "PromotionAnnouncement" => ENotificationPriority.High,
                "OrderStatusChanged" or "OrderConfirmed" => ENotificationPriority.Normal,
                "NewOrder" or "NewCustomer" => ENotificationPriority.Normal,
                "NewPromotion" or "CustomerLevelUpgraded" => ENotificationPriority.Normal,
                _ => ENotificationPriority.Low
            };
        }

        public async Task SendPromotionAnnouncementAsync(string title, string message, DateTime? expiresAt = null, Guid? targetUserId = null, string? targetGroup = null, string? actionUrl = null, string? imageUrl = null)
        {
            var notification = new Notification
            {
                Title = title,
                Message = message,
                Type = "PromotionAnnouncement",
                Category = ENotificationCategory.Promotion,
                Priority = ENotificationPriority.High,
                RecipientId = targetUserId ?? (Guid?)null,
                TargetGroup = targetGroup,
                ExpiresAt = expiresAt,
                ActionUrl = actionUrl,
                IsSentRealtime = false,
                IsSentEmail = false,
                IconUrl = imageUrl,
                IsRead = false,
            };
            await _notificationRepository.AddAsync(notification);
            await _notificationRepository.SaveChangesAsync();
            await _hubContext.Clients.All.SendAsync("ReceiveNotification", "PromotionAnnouncement", notification);
            await _notificationRepository.UpdateDeliveryStatusAsync(notification.Id, isSentRealtime: true);
            await _notificationRepository.SaveChangesAsync();
        }

        public async Task SendMaintenanceNotificationAsync(string title, string message, DateTime scheduledTime, int durationMinutes, string? actionUrl = null)
        {

            var notification = new Notification
            {
                Title = title,
                Message = message,
                Type = "SystemMaintenance",
                Category = ENotificationCategory.Maintenance,
                Priority = ENotificationPriority.High,
                ExpiresAt = scheduledTime.AddMinutes(durationMinutes),
                ActionUrl = actionUrl,
                IsSentRealtime = false,
                IsSentEmail = false
            };
            await _notificationRepository.AddAsync(notification);
            await _notificationRepository.SaveChangesAsync();
            await _hubContext.Clients.All.SendAsync("ReceiveNotification", "SystemMaintenance", notification);
            await _notificationRepository.UpdateDeliveryStatusAsync(notification.Id, isSentRealtime: true);
            await _notificationRepository.SaveChangesAsync();
        }
    }
}

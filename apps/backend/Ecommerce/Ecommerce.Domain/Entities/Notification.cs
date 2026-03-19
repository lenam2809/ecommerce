using Ecommerce.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace Ecommerce.Domain.Entities
{
    /// <summary>
    /// Entity để lưu trữ thông báo trong hệ thống
    /// </summary>
    public class Notification : BaseEntity
    {
        [Required]
        [MaxLength(100)]
        public string Title { get; set; } = string.Empty; // Tiêu đề thông báo

        [Required]
        [MaxLength(1000)]
        public string Message { get; set; } = string.Empty; // Nội dung thông báo

        [Required]
        [MaxLength(50)]
        public string Type { get; set; } = string.Empty; // Loại thông báo (NewOrder, OrderStatusChanged, NewPromotion, etc.)

        public ENotificationCategory Category { get; set; } // Danh mục thông báo

        public ENotificationPriority Priority { get; set; } = ENotificationPriority.Normal; // Mức độ ưu tiên

        public bool IsRead { get; set; } = false; // Đã đọc chưa

        public DateTime? ReadAt { get; set; } // Thời gian đọc

        public DateTime? ExpiresAt { get; set; } // Thời gian hết hạn (cho thông báo khuyến mãi)

        // Người gửi (có thể là system hoặc admin)
        public Guid? SenderId { get; set; }
        public ApplicationUser? Sender { get; set; }

        // Người nhận (null nếu gửi cho tất cả)
        public Guid? RecipientId { get; set; }
        public ApplicationUser? Recipient { get; set; }

        // Nhóm người nhận (Administrators, Customers, etc.)
        [MaxLength(50)]
        public string? TargetGroup { get; set; }

        // Metadata để lưu thông tin bổ sung (JSON format)
        public string? Metadata { get; set; }

        // URL để điều hướng khi click vào thông báo
        [MaxLength(500)]
        public string? ActionUrl { get; set; }

        // Icon hoặc hình ảnh cho thông báo
        [MaxLength(500)]
        public string? IconUrl { get; set; }

        // Thông báo có được gửi qua SignalR chưa
        public bool IsSentRealtime { get; set; } = false;

        // Thông báo có được gửi qua email chưa
        public bool IsSentEmail { get; set; } = false;

        // Số lần thử gửi lại (cho trường hợp thất bại)
        public int RetryCount { get; set; } = 0;

        // Lỗi cuối cùng nếu có
        [MaxLength(1000)]
        public string? LastError { get; set; }
    }
}


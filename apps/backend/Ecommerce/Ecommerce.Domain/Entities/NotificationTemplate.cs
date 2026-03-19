using Ecommerce.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace Ecommerce.Domain.Entities
{
    /// <summary>
    /// Entity để lưu trữ template thông báo
    /// </summary>
    public class NotificationTemplate : BaseEntity
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty; // Tên template

        [Required]
        [MaxLength(50)]
        public string Code { get; set; } = string.Empty; // Mã template (unique)

        [Required]
        public ENotificationType Type { get; set; } // Loại thông báo

        public ENotificationCategory Category { get; set; } // Danh mục

        [Required]
        [MaxLength(200)]
        public string TitleTemplate { get; set; } = string.Empty; // Template tiêu đề

        [Required]
        [MaxLength(2000)]
        public string MessageTemplate { get; set; } = string.Empty; // Template nội dung

        [MaxLength(500)]
        public string? IconUrl { get; set; } // Icon mặc định

        public ENotificationPriority DefaultPriority { get; set; } = ENotificationPriority.Normal;

        public bool IsActive { get; set; } = true; // Template có đang hoạt động

        public bool RequireEmail { get; set; } = false; // Có gửi email không

        public bool RequireRealtime { get; set; } = true; // Có gửi realtime không

        // Email template (nếu có)
        [MaxLength(200)]
        public string? EmailSubjectTemplate { get; set; }

        [MaxLength(5000)]
        public string? EmailBodyTemplate { get; set; }

        // Thời gian hết hạn mặc định (minutes)
        public int? DefaultExpiryMinutes { get; set; }

        // Placeholder variables (JSON format)
        public string? Variables { get; set; }

        [MaxLength(1000)]
        public string? Description { get; set; } // Mô tả template
    }
}


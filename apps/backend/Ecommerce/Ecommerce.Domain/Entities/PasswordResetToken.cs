using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Ecommerce.Domain.Entities
{
    /// <summary>
    /// Token đặt lại mật khẩu — có hiệu lực 1 giờ, chỉ dùng được 1 lần
    /// </summary>
    public class PasswordResetToken
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [EmailAddress]
        [StringLength(256)]
        public string Email { get; set; } = string.Empty;

        /// <summary>
        /// Token ngẫu nhiên dạng Base64Url (32 bytes = 256 bits entropy)
        /// </summary>
        [Required]
        [StringLength(256)]
        public string Token { get; set; } = string.Empty;

        /// <summary>
        /// Thời điểm tạo token
        /// </summary>
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// Token hết hạn sau 1 giờ
        /// </summary>
        public DateTime ExpiresAt { get; set; }

        /// <summary>
        /// Thời điểm token đã được sử dụng (null nếu chưa dùng)
        /// </summary>
        public DateTime? UsedAt { get; set; }

        [NotMapped]
        public bool IsExpired => DateTime.UtcNow > ExpiresAt;

        [NotMapped]
        public bool IsUsed => UsedAt.HasValue;

        [NotMapped]
        public bool IsValid => !IsExpired && !IsUsed;
    }
}

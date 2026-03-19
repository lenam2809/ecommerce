using Ecommerce.Domain.Enums;
using System.ComponentModel.DataAnnotations.Schema;

namespace Ecommerce.Domain.Entities
{
    public class AccountLock : BaseEntity
    {

        [ForeignKey(nameof(ApplicationUser))]
        public Guid UserId { get; set; }

        public required string Reason { get; set; } // Lý do khóa
        public ELockType LockType { get; set; } // Temporary, Permanent
        public DateTime LockedAt { get; set; } = DateTime.Now;
        public DateTime? UnlockedAt { get; set; }
        public DateTime? ExpiresAt { get; set; } // Thời gian tự động mở khóa
        public bool IsActive { get; set; } = true;

        [ForeignKey(nameof(LockedByUser))]
        public Guid? LockedByUserId { get; set; } // Admin thực hiện khóa

        [ForeignKey(nameof(UnlockedByUser))]
        public Guid? UnlockedByUserId { get; set; } // Admin thực hiện mở khóa

        public string Notes { get; set; } = string.Empty; // Ghi chú thêm

        // Navigation properties
        public virtual ApplicationUser User { get; set; } = null!;
        public virtual ApplicationUser? LockedByUser { get; set; }
        public virtual ApplicationUser? UnlockedByUser { get; set; }
    }
}


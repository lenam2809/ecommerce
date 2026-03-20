using Ecommerce.Domain.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Ecommerce.Domain.Entities
{
    public class OrderHistory : BaseEntity
    {
        [ForeignKey(nameof(Order))]
        public Guid OrderId { get; set; }

        [Required]
        public EOrderStatus FromStatus { get; set; }

        [Required]
        public EOrderStatus ToStatus { get; set; }

        [StringLength(500)]
        public string Notes { get; set; } = string.Empty;

        [Required]
        public required string ChangedBy { get; set; } // User Name hoặc System

        [Required]
        [StringLength(50)]
        public string ChangeSource { get; set; } = string.Empty; // Manual, System, API, etc.

        public DateTime ChangedAt { get; set; } = DateTime.Now;

        [Column(TypeName = "decimal(18,2)")]
        public decimal? PreviousTotalAmount { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? NewTotalAmount { get; set; }

        [StringLength(500)]
        public string PreviousShippingAddress { get; set; } = string.Empty;

        [StringLength(500)]
        public string NewShippingAddress { get; set; } = string.Empty;

        public DateTime? PreviousExpectedDeliveryDate { get; set; }

        public DateTime? NewExpectedDeliveryDate { get; set; }

        [StringLength(50)]
        public string PreviousDiscountCode { get; set; } = string.Empty;

        [StringLength(50)]
        public string NewDiscountCode { get; set; } = string.Empty;

        // JSON field để lưu thêm các thông tin khác nếu cần
        public string AdditionalData { get; set; } = string.Empty;

        // Navigation property
        public virtual Order Order { get; set; } = null!;
    }
}


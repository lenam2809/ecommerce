using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Ecommerce.Domain.Entities
{
    public class PaymentTransaction : BaseEntity
    {
        [Required]
        [StringLength(100)]
        public string TxnRef { get; set; } = string.Empty;

        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }

        public PaymentTransactionStatus Status { get; set; } = PaymentTransactionStatus.Pending;

        [StringLength(20)]
        public string ResponseCode { get; set; } = string.Empty;
    }

    public enum PaymentTransactionStatus
    {
        Pending = 0,
        Success = 1,
        Failed = 2,
        Expired = 3
    }
}

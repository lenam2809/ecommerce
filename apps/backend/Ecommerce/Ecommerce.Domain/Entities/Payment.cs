using Ecommerce.Domain.Enums;
using System.ComponentModel.DataAnnotations.Schema;

namespace Ecommerce.Domain.Entities
{
    public class Payment : BaseEntity
    {
        [ForeignKey(nameof(Order))]
        public Guid OrderId { get; set; }
        public decimal Amount { get; set; }
        public EPaymentMethod PaymentMethod { get; set; }
        public required string TransactionId { get; set; }
        public DateTime PaymentDate { get; set; } = DateTime.Now;
        public bool IsSuccessful { get; set; }

        public virtual Order Order { get; set; } = null!;
    }
}


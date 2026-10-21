namespace Ecommerce.Domain.Entities
{
    public class LoyaltyPointTransaction : BaseEntity
    {
        public Guid UserId { get; set; }
        public Guid? OrderId { get; set; }
        public int Points { get; set; }
        public string TransactionType { get; set; } = "OrderReward"; // OrderReward, RedeemVoucher, ManualAdjustment, RefundDeduction
        public string? Note { get; set; }

        // Navigation properties
        public virtual ApplicationUser User { get; set; } = null!;
        public virtual Order? Order { get; set; }
    }
}

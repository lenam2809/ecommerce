namespace Ecommerce.Domain.Entities
{
    public class Voucher : BaseEntity
    {
        public string Code { get; set; } = string.Empty;
        public string DiscountType { get; set; } = "FixedAmount"; // FixedAmount or Percentage
        public decimal DiscountValue { get; set; }
        public decimal MinOrderValue { get; set; }
        public decimal? MaxDiscountAmount { get; set; }
        public DateTime ValidFrom { get; set; }
        public DateTime ValidTo { get; set; }
        public int UsageLimit { get; set; }
        public int UsedCount { get; set; } = 0;
        public bool IsActive { get; set; } = true;
    }
}

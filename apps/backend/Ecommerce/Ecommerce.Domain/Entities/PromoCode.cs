namespace Ecommerce.Domain.Entities
{
    public class PromoCode : BaseEntity
    {
        public required string Code { get; set; }
        public required string Description { get; set; }
        public PromoCodeType Type { get; set; }
        public decimal DiscountPercentage { get; set; } // For percentage discounts
        public decimal DiscountAmount { get; set; } // For fixed amount discounts
        public bool FreeShipping { get; set; }
        public DateTime ValidFrom { get; set; }
        public DateTime ValidTo { get; set; }
        public int UsageLimit { get; set; }
        public int TimesUsed { get; set; }
        public bool IsActive { get; set; }
    }

    public enum PromoCodeType
    {
        PercentageDiscount,
        FixedAmountDiscount,
        FreeShipping,
        Mixed
    }
}


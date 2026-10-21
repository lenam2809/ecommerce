namespace Ecommerce.Domain.Entities
{
    public class FlashSaleItem : BaseEntity
    {
        public Guid FlashSaleId { get; set; }
        public Guid ProductId { get; set; }
        public Guid? ProductVariantSkuId { get; set; }
        public decimal FlashSalePrice { get; set; }
        public decimal OriginalPrice { get; set; }
        public int TotalQuota { get; set; }
        public int SoldCount { get; set; } = 0;
        public int MaxPerCustomer { get; set; } = 1;
        public bool IsHeroFeatured { get; set; } = false;
        public string? BadgeText { get; set; }
        public int DisplayOrder { get; set; } = 0;

        public decimal FlashPrice
        {
            get => FlashSalePrice;
            set => FlashSalePrice = value;
        }

        public int QuantityLimit
        {
            get => TotalQuota;
            set => TotalQuota = value;
        }

        public int SoldQuantity
        {
            get => SoldCount;
            set => SoldCount = value;
        }

        // Navigation properties
        public virtual FlashSale FlashSale { get; set; } = null!;
        public virtual Product Product { get; set; } = null!;
        public virtual ProductVariantSku? ProductVariantSku { get; set; }
    }
}

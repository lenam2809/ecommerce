namespace Ecommerce.Domain.Entities
{
    public class ShowroomInventory
    {
        public Guid ShowroomId { get; set; }
        public Guid ProductId { get; set; }
        public Guid? ProductVariantSkuId { get; set; }
        public int Quantity { get; set; } = 0;
        public int ReservedQuantity { get; set; } = 0;
        public bool IsAvailableFor2hDelivery { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        public int StockQuantity
        {
            get => Quantity;
            set => Quantity = value;
        }

        // Navigation properties
        public virtual Showroom Showroom { get; set; } = null!;
        public virtual Product Product { get; set; } = null!;
        public virtual ProductVariantSku? ProductVariantSku { get; set; }
    }
}

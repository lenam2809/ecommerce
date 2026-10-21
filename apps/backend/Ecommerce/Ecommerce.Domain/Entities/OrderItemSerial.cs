namespace Ecommerce.Domain.Entities
{
    public class OrderItemSerial : BaseEntity
    {
        public Guid OrderItemId { get; set; }
        public Guid? InventoryItemId { get; set; }
        public string SerialNumber { get; set; } = string.Empty;
        public string? Imei { get; set; }
        public int WarrantyMonths { get; set; } = 24;
        public DateTime? ActivatedAt { get; set; }
        public DateTime? WarrantyExpiresAt { get; set; }
        public string WarrantyStatus { get; set; } = "Active"; // Active, Expired, Voided

        // Navigation properties
        public virtual OrderItem OrderItem { get; set; } = null!;
        public virtual InventoryItem? InventoryItem { get; set; }
    }
}

using System.ComponentModel.DataAnnotations.Schema;

namespace Ecommerce.Domain.Entities
{
    public class OrderItem
    {
        public Guid Id { get; private set; } = Guid.NewGuid();

        // EF Core
        private OrderItem() { }

        public OrderItem(Guid orderId, Guid productId, string name, string image, decimal unitPrice, 
            int quantity, string? color, string? size, 
            Guid? productVariantSkuId = null, string? skuCode = null, string? variantInfo = null)
        {
            OrderId = orderId;
            ProductId = productId;
            Name = name;
            Image = image;
            UnitPrice = unitPrice;
            Quantity = quantity;
            Color = color ?? string.Empty;
            Size = size ?? string.Empty;
            ProductVariantSkuId = productVariantSkuId;
            SkuCode = skuCode ?? string.Empty;
            VariantInfo = variantInfo ?? string.Empty;
            DateAdded = DateTime.Now;
        }

        [ForeignKey(nameof(Order))]
        public Guid OrderId { get; private set; }
        
        [ForeignKey(nameof(Product))]
        public Guid ProductId { get; private set; }
        
        public int Quantity { get; internal set; } // Internal set to allow Order to update it if needed (e.g. merging items)

        [Column(TypeName = "decimal(18,2)")]
        public decimal UnitPrice { get; private set; }
        
        public string Name { get; private set; } = string.Empty;
        public string Image { get; private set; } = string.Empty;
        public string Color { get; private set; } = string.Empty;
        public string Size { get; private set; } = string.Empty;
        public DateTime DateAdded { get; private set; } = DateTime.Now;

        /// <summary>
        /// Link tới SKU biến thể cụ thể (nullable cho sản phẩm không có variant)
        /// </summary>
        [ForeignKey(nameof(ProductVariantSku))]
        public Guid? ProductVariantSkuId { get; private set; }

        /// <summary>
        /// Snapshot mã SKU tại thời điểm mua ("IPHONE16PRO-256-BLACK")
        /// </summary>
        public string SkuCode { get; private set; } = string.Empty;

        /// <summary>
        /// Snapshot thông tin biến thể hiển thị ("256GB / Đen Titan")
        /// </summary>
        public string VariantInfo { get; private set; } = string.Empty;

        // Navigation properties
        public virtual Order Order { get; private set; } = null!;
        public virtual Product Product { get; private set; } = null!;
        public virtual ProductVariantSku? ProductVariantSku { get; private set; }

        /// <summary>
        /// Các IMEI/Serial đã gắn vào line item này
        /// </summary>
        public virtual ICollection<InventoryItem> AssignedSerials { get; private set; } = new List<InventoryItem>();

        public void AddQuantity(int quantity)
        {
            Quantity += quantity;
        }
    }
}


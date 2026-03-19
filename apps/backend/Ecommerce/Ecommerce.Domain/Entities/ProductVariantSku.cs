using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Ecommerce.Domain.Exceptions;

namespace Ecommerce.Domain.Entities
{
    /// <summary>
    /// Mỗi tổ hợp variant là một SKU riêng biệt với Price/Stock độc lập.
    /// Ví dụ: iPhone 16 Pro - 256GB - Đen Titan = 1 SKU "IPHONE16PRO-256-BLACK"
    /// </summary>
    public class ProductVariantSku : BaseEntity
    {
        [ForeignKey(nameof(Product))]
        public Guid ProductId { get; private set; }

        [Required]
        [StringLength(100)]
        public string Sku { get; private set; } = string.Empty;  // "IPHONE16PRO-256-BLACK"

        [Column(TypeName = "decimal(18,2)")]
        [Range(0, double.MaxValue)]
        public decimal Price { get; private set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? SalePrice { get; private set; }

        [Range(0, int.MaxValue)]
        public int StockQuantity { get; private set; }

        [StringLength(50)]
        public string? Barcode { get; private set; }

        public bool IsActive { get; private set; } = true;

        // Navigation properties
        public virtual Product Product { get; private set; } = null!;

        private readonly List<SkuAttributeValue> _attributeValues = new();
        public virtual IReadOnlyCollection<SkuAttributeValue> AttributeValues => _attributeValues.AsReadOnly();

        private readonly List<InventoryItem> _inventoryItems = new();
        public virtual IReadOnlyCollection<InventoryItem> InventoryItems => _inventoryItems.AsReadOnly();

        // EF Core constructor
        private ProductVariantSku() { }

        public static ProductVariantSku Create(
            Guid productId, string sku, decimal price,
            decimal? salePrice, int stockQuantity, string? barcode = null)
        {
            if (price < 0) throw new DomainException("Giá SKU không được âm.");
            if (salePrice.HasValue && salePrice.Value >= price)
                throw new DomainException("Giá khuyến mãi phải nhỏ hơn giá gốc.");
            if (stockQuantity < 0) throw new DomainException("Tồn kho không được âm.");

            return new ProductVariantSku
            {
                ProductId = productId,
                Sku = sku.Trim().ToUpperInvariant(),
                Price = price,
                SalePrice = salePrice,
                StockQuantity = stockQuantity,
                Barcode = barcode,
                IsActive = true
            };
        }

        public void UpdateInfo(string sku, decimal price, decimal? salePrice, string? barcode, bool isActive)
        {
            if (price < 0) throw new DomainException("Giá SKU không được âm.");
            if (salePrice.HasValue && salePrice.Value >= price)
                throw new DomainException("Giá khuyến mãi phải nhỏ hơn giá gốc.");

            Sku = sku.Trim().ToUpperInvariant();
            Price = price;
            SalePrice = salePrice;
            Barcode = barcode;
            IsActive = isActive;
        }

        public void UpdateStock(int quantity)
        {
            if (quantity < 0) throw new DomainException("Tồn kho không được âm.");
            StockQuantity = quantity;
        }

        public void ReserveStock(int quantity)
        {
            if (StockQuantity < quantity)
                throw new DomainException(
                    $"Không đủ tồn kho cho SKU {Sku}. Hiện có: {StockQuantity}, cần: {quantity}");
            StockQuantity -= quantity;
        }

        public void ReleaseStock(int quantity)
        {
            StockQuantity += quantity;
        }

        public void AddAttributeValue(Guid attributeValueId)
        {
            if (_attributeValues.Any(av => av.ProductAttributeValueId == attributeValueId))
                return; // idempotent
            _attributeValues.Add(new SkuAttributeValue(this.Id, attributeValueId));
        }

        public void ClearAttributeValues()
        {
            _attributeValues.Clear();
        }

        /// <summary>
        /// Lấy giá hiệu lực (ưu tiên SalePrice nếu có)
        /// </summary>
        public decimal EffectivePrice => SalePrice ?? Price;
    }
}

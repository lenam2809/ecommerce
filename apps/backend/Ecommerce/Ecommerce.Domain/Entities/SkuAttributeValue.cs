namespace Ecommerce.Domain.Entities
{
    /// <summary>
    /// Bảng trung gian: SKU ↔ ProductAttributeValue (N-N)
    /// Xác định tổ hợp thuộc tính nào tạo thành một SKU.
    /// Ví dụ: SKU "IPHONE16-256-BLACK" ↔ [256GB, Đen Titan]
    /// </summary>
    public class SkuAttributeValue
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid ProductVariantSkuId { get; set; }
        public Guid ProductAttributeValueId { get; set; }

        // Navigation properties
        public virtual ProductVariantSku ProductVariantSku { get; set; } = null!;
        public virtual ProductAttributeValue ProductAttributeValue { get; set; } = null!;

        // EF Core constructor
        private SkuAttributeValue() { }

        public SkuAttributeValue(Guid skuId, Guid attrValueId)
        {
            ProductVariantSkuId = skuId;
            ProductAttributeValueId = attrValueId;
        }
    }
}

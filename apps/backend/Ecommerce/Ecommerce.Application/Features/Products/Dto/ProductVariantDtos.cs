namespace Ecommerce.Application.Features.Products.Dto
{
    /// <summary>
    /// DTO cho thuộc tính sản phẩm (RAM, ROM, Màu sắc...)
    /// </summary>
    public class ProductAttributeDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int DisplayOrder { get; set; }
        public List<ProductAttributeValueDto> Values { get; set; } = [];
    }

    /// <summary>
    /// DTO cho giá trị thuộc tính (8GB, 256GB, Đen Titan...)
    /// </summary>
    public class ProductAttributeValueDto
    {
        public Guid Id { get; set; }
        public string Value { get; set; } = string.Empty;
        public string? ColorHex { get; set; }
        public string? ImageUrl { get; set; }
        public int DisplayOrder { get; set; }
    }

    /// <summary>
    /// DTO cho SKU biến thể với giá và tồn kho riêng
    /// </summary>
    public class ProductVariantSkuDto
    {
        public Guid Id { get; set; }
        public string Sku { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public decimal? SalePrice { get; set; }
        public decimal EffectivePrice { get; set; }
        public int StockQuantity { get; set; }
        public string? Barcode { get; set; }
        public bool IsActive { get; set; }
        public List<SkuAttributeValueDto> AttributeValues { get; set; } = [];
    }

    /// <summary>
    /// DTO cho mapping SKU ↔ AttributeValue
    /// </summary>
    public class SkuAttributeValueDto
    {
        public Guid AttributeValueId { get; set; }
        public string AttributeName { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
        public string? ColorHex { get; set; }
    }
}

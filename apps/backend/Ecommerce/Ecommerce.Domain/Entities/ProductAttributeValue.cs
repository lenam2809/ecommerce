using System.ComponentModel.DataAnnotations;

namespace Ecommerce.Domain.Entities
{
    /// <summary>
    /// Giá trị cụ thể của thuộc tính sản phẩm (8GB, 16GB, Đen Titan, Trắng...)
    /// Có thể kèm ColorHex cho variant màu sắc và ImageUrl cho hình variant.
    /// </summary>
    public class ProductAttributeValue : BaseEntity
    {
        public Guid ProductAttributeId { get; private set; }

        [Required]
        [StringLength(200)]
        public string Value { get; private set; } = string.Empty; // "8GB", "256GB", "Đen Titan"

        [StringLength(10)]
        public string? ColorHex { get; private set; }  // "#1C1C1E" cho variant màu

        [StringLength(500)]
        public string? ImageUrl { get; private set; }   // URL hình variant

        public int DisplayOrder { get; private set; }

        // Navigation properties
        public virtual ProductAttribute ProductAttribute { get; private set; } = null!;
        public virtual ICollection<SkuAttributeValue> SkuAttributeValues { get; private set; } = new List<SkuAttributeValue>();

        // EF Core constructor
        private ProductAttributeValue() { }

        public ProductAttributeValue(Guid attributeId, string value, int displayOrder,
            string? colorHex = null, string? imageUrl = null)
        {
            ProductAttributeId = attributeId;
            Value = value;
            DisplayOrder = displayOrder;
            ColorHex = colorHex;
            ImageUrl = imageUrl;
        }

        public void Update(string value, int displayOrder, string? colorHex, string? imageUrl)
        {
            Value = value;
            DisplayOrder = displayOrder;
            ColorHex = colorHex;
            ImageUrl = imageUrl;
        }
    }
}

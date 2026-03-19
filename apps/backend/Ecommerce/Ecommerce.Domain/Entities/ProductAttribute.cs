using System.ComponentModel.DataAnnotations;

namespace Ecommerce.Domain.Entities
{
    /// <summary>
    /// Thuộc tính của sản phẩm (RAM, ROM, Màu sắc, Dung lượng...)
    /// Mỗi Product có thể có nhiều ProductAttribute, mỗi attribute có nhiều value.
    /// </summary>
    public class ProductAttribute : BaseEntity
    {
        public Guid ProductId { get; private set; }

        [Required]
        [StringLength(100)]
        public string Name { get; private set; } = string.Empty; // "RAM", "ROM", "Màu sắc"

        public int DisplayOrder { get; private set; }

        // Navigation properties
        public virtual Product Product { get; private set; } = null!;

        private readonly List<ProductAttributeValue> _values = new();
        public virtual IReadOnlyCollection<ProductAttributeValue> Values => _values.AsReadOnly();

        // EF Core constructor
        private ProductAttribute() { }

        public static ProductAttribute Create(Guid productId, string name, int displayOrder)
        {
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("Tên thuộc tính không được để trống.");

            return new ProductAttribute
            {
                ProductId = productId,
                Name = name.Trim(),
                DisplayOrder = displayOrder
            };
        }

        public ProductAttributeValue AddValue(string value, int displayOrder, string? colorHex = null, string? imageUrl = null)
        {
            if (string.IsNullOrWhiteSpace(value))
                throw new ArgumentException("Giá trị thuộc tính không được để trống.");

            var attrValue = new ProductAttributeValue(this.Id, value.Trim(), displayOrder, colorHex, imageUrl);
            _values.Add(attrValue);
            return attrValue;
        }

        public void UpdateInfo(string name, int displayOrder)
        {
            Name = name.Trim();
            DisplayOrder = displayOrder;
        }

        public void ClearValues()
        {
            _values.Clear();
        }
    }
}

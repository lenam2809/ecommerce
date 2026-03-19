namespace Ecommerce.Domain.Entities
{
    public class Brand : BaseEntity
    {
        public required string Code { get; set; } // Mã thương hiệu (ví dụ: "iphone", "samsung")
        public required string Name { get; set; } // Tên thương hiệu (ví dụ: "iPhone", "Samsung")
        public string Description { get; set; } = string.Empty; // Mô tả thương hiệu
        public string LogoUrl { get; set; } = string.Empty; // URL logo thương hiệu
        public bool IsActive { get; set; } = true; // Trạng thái hoạt động
        public required string Slug { get; set; } // Slug cho URL (ví dụ: "iphone", "samsung")

        // Navigation properties
        public ICollection<Product> Products { get; set; } = [];
        public ICollection<CategoryBrand> CategoryBrands { get; set; } = [];
    }
}


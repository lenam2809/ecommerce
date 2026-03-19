namespace Ecommerce.Domain.Entities
{
    public class Category : BaseEntity
    {
        public required string Code { get; set; } // Mã danh mục (ví dụ: "dien-thoai")
        public required string Name { get; set; } // Tên danh mục (ví dụ: "Điện thoại")
        public string Description { get; set; } = string.Empty; // Mô tả danh mục
        public string Image { get; set; } = string.Empty; // URL hình ảnh danh mục
        public required string Slug { get; set; } // Slug cho URL (ví dụ: "dien-thoai")
        public Guid? ParentId { get; set; } // ID của danh mục cha
        public bool IsActive { get; set; } = true; // Trạng thái hoạt động
        public int DisplayOrder { get; set; } // Thứ tự hiển thị trong menu hoặc danh sách

        // Navigation properties
        public virtual Category? Parent { get; set; } // Danh mục cha
        public virtual ICollection<Category> Children { get; set; } = []; // Danh mục con
        public virtual ICollection<Product> Products { get; set; } = []; // Sản phẩm thuộc danh mục
        public ICollection<CategoryBrand> CategoryBrands { get; set; } = [];
    }
}


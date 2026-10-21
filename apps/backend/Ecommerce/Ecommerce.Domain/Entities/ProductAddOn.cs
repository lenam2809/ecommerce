namespace Ecommerce.Domain.Entities
{
    public class ProductAddOn : BaseEntity
    {
        public Guid? ProductId { get; set; }
        public Guid? CategoryId { get; set; }
        public Guid? BrandId { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string AddOnType { get; set; } = "ExtendedWarranty"; // ExtendedWarranty, AccessoryBundle, Installation
        public decimal Price { get; set; }
        public decimal? OriginalPrice { get; set; }
        public int? DurationMonths { get; set; }
        public bool IsActive { get; set; } = true;
        public int DisplayOrder { get; set; } = 0;

        // Navigation properties
        public virtual Product? Product { get; set; }
        public virtual Category? Category { get; set; }
        public virtual Brand? Brand { get; set; }
    }
}

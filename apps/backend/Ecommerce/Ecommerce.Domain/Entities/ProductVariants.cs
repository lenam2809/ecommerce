namespace Ecommerce.Domain.Entities
{
    public class ProductVariants : BaseEntity
    {
        public Guid ProductId { get; set; }
        public virtual Product Product { get; set; } = null!;

        public ICollection<ProductColor> Colors { get; set; } = new List<ProductColor>();
        public ICollection<ProductSize> Sizes { get; set; } = new List<ProductSize>();
    }

    public class ProductColor
    {
        public Guid Id { get; set; }
        public Guid ProductVariantId { get; set; }
        public virtual ProductVariants ProductVariant { get; set; } = null!;
        public required string Color { get; set; }
    }

    public class ProductSize
    {
        public Guid Id { get; set; }
        public Guid ProductVariantId { get; set; }
        public virtual ProductVariants ProductVariant { get; set; } = null!;
        public required string Size { get; set; }
    }
}


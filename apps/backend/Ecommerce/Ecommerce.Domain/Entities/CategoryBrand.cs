namespace Ecommerce.Domain.Entities
{
    public class CategoryBrand
    {
        public Guid CategoryId { get; set; }
        public virtual Category Category { get; set; } = null!;

        public Guid BrandId { get; set; }
        public virtual Brand Brand { get; set; } = null!;

        public DateTime LinkedAt { get; set; } = DateTime.Now;
    }

}


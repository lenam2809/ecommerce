using System.ComponentModel.DataAnnotations.Schema;

namespace Ecommerce.Domain.Entities
{
    public class ProductSpecification : BaseEntity
    {
        public required string Name { get; set; }
        public required string Value { get; set; }
        [ForeignKey(nameof(Product))]
        public Guid ProductId { get; set; }
        public virtual Product Product { get; set; } = null!;
    }
}


using System.ComponentModel.DataAnnotations.Schema;

namespace Ecommerce.Domain.Entities
{
    public class ProductImage : BaseEntity
    {
        [ForeignKey(nameof(Product))]
        public Guid ProductId { get; set; }
        public required string Url { get; set; }
        public virtual Product Product { get; set; } = null!;
    }
}


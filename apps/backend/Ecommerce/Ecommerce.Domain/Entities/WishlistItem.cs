using System.ComponentModel.DataAnnotations.Schema;

namespace Ecommerce.Domain.Entities
{
    public class WishlistItem
    {
        [ForeignKey(nameof(Wishlist))]
        public Guid WishlistId { get; set; }
        [ForeignKey(nameof(Product))]
        public Guid ProductId { get; set; }
        public virtual Wishlist Wishlist { get; set; } = null!;
        public virtual Product Product { get; set; } = null!;
        public DateTime DateAdded { get; set; } = DateTime.Now;
    }
}


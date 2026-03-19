using System.ComponentModel.DataAnnotations;

namespace Ecommerce.Domain.Entities
{
    public class Wishlist : BaseEntity
    {
        public Guid ApplicationUserId { get; set; }
        public virtual ApplicationUser ApplicationUser { get; set; } = null!;
        public virtual ICollection<WishlistItem> WishlistItems { get; set; } = new List<WishlistItem>();

        [Range(0, 50, ErrorMessage = "Số lượng sản phẩm trong wishlist không quá 50")]
        public int WishlistItemLimit { get; set; } = 50;
    }
}


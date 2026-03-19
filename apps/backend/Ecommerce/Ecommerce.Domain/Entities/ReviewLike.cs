namespace Ecommerce.Domain.Entities
{
    public class ReviewLike : BaseEntity
    {
        public Guid ReviewId { get; set; }
        public Guid UserId { get; set; }
        public virtual Review Review { get; set; } = null!;
        public virtual ApplicationUser User { get; set; } = null!;
    }


}


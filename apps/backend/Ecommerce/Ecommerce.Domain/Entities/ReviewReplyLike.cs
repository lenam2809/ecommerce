namespace Ecommerce.Domain.Entities
{
    public class ReviewReplyLike : BaseEntity
    {
        public Guid ReviewReplyId { get; set; }
        public Guid UserId { get; set; }
        public virtual ReviewReply ReviewReply { get; set; } = null!;
        public virtual ApplicationUser User { get; set; } = null!;
    }
}


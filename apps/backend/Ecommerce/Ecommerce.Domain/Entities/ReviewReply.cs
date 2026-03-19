namespace Ecommerce.Domain.Entities
{
    public class ReviewReply : BaseEntity
    {
        public Guid ReviewId { get; set; }
        public Guid UserId { get; set; }
        public required string UserName { get; set; }
        public required string UserAvatar { get; set; }
        public required string Content { get; set; }
        public DateTime Date { get; set; }
        public int Likes { get; set; } = 0;
        public bool IsVerified { get; set; } = false;

        // Navigation properties
        public virtual Review Review { get; set; } = null!;
        public virtual ApplicationUser User { get; set; } = null!;
        public virtual ICollection<ReviewReplyLike> ReviewReplyLikes { get; set; } = [];
    }
}


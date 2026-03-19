namespace Ecommerce.Domain.Entities
{
    public class Review : BaseEntity
    {
        public required string UserName { get; set; }
        public required string UserAvatar { get; set; }
        public int Rating { get; set; }
        public DateTime Date { get; set; }
        public required string Content { get; set; }
        public int Likes { get; set; }
        public int Replies { get; set; }
        public bool IsVerified { get; set; } = false;
        public int HelpfulCount { get; set; } = 0;
        public List<ReviewImage> Images { get; set; } = [];
        public Guid ProductId { get; set; }
        public virtual Product Product { get; set; } = null!;
        public Guid ApplicationUserId { get; set; }
        public virtual ApplicationUser ApplicationUser { get; set; } = null!;
        public virtual ICollection<ReviewLike> ReviewLikes { get; set; } = [];
        public virtual ICollection<ReviewReply> ReviewReplies { get; set; } = [];
    }


}


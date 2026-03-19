namespace Ecommerce.Domain.Entities
{
    public class ReviewImage : BaseEntity
    {
        public Guid ReviewId { get; set; }
        public required string Url { get; set; }
        public virtual Review Review { get; set; } = null!;
    }

}


namespace Ecommerce.Domain.Entities
{
    public class ProductReviews
    {
        public List<Review> Reviews { get; set; } = new List<Review>();
        public double Rating { get; set; }
        public int ReviewCount { get; set; }
        public List<RatingDistribution> RatingDistribution { get; set; } = new List<RatingDistribution>();
    }
}


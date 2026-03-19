namespace Ecommerce.Application.Features.Products.Dto
{
    public class ReviewsResponseDto
    {
        public List<ReviewDto> Reviews { get; set; } = [];
        public double Rating { get; set; }
        public int ReviewCount { get; set; }
        public List<RatingDistributionDto> RatingDistribution { get; set; } = [];
    }
}


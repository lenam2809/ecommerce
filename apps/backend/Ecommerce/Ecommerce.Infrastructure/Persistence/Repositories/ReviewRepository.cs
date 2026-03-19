using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Infrastructure.Persistence.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Infrastructure.Persistence.Repositories
{
    public class ReviewRepository : BaseRepository<Review>, IReviewRepository
    {
        public ReviewRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<ProductReviews> GetProductReviewsAsync(Guid productId)
        {
            var reviews = await _context.Reviews
                .Where(r => r.ProductId == productId)
                .OrderByDescending(r => r.CreatedAt) // Lấy đánh giá mới nhất trước
                .ToListAsync();

            int reviewCount = reviews.Count;
            double averageRating = reviewCount > 0 ? reviews.Average(r => r.Rating) : 0;

            var distribution = Enumerable.Range(1, 5) // Lặp từ 1 đến 5 sao
                .Select(star => new RatingDistribution
                {
                    Stars = star,
                    Percentage = reviewCount > 0
                        ? (int)((double)reviews.Count(r => r.Rating == star) / reviewCount * 100)
                        : 0
                })
                .OrderByDescending(d => d.Stars)
                .ToList();

            return new ProductReviews
            {
                Reviews = reviews,
                Rating = Math.Round(averageRating, 2), // Làm tròn đến 2 chữ số thập phân
                ReviewCount = reviewCount,
                RatingDistribution = distribution
            };
        }

        public async Task<double> GetAverageRatingAsync(Guid productId)
        {
            return await _context.Reviews
                .Where(r => r.ProductId == productId)
                .Select(r => (double?)r.Rating)
                .AverageAsync() ?? 0.0;
        }

    }
}


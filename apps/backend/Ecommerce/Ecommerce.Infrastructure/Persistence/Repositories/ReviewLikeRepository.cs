using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Infrastructure.Persistence.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Infrastructure.Persistence.Repositories
{

    public class ReviewLikeRepository : BaseRepository<ReviewLike>, IReviewLikeRepository
    {
        public ReviewLikeRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<ReviewLike?> GetByUserAndReviewAsync(Guid userId, Guid reviewId)
        {
            return await _context.ReviewLikes
                .FirstOrDefaultAsync(x => x.UserId == userId && x.ReviewId == reviewId);
        }
    }
}


using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Infrastructure.Persistence.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Infrastructure.Persistence.Repositories
{
    public class ReviewReplyRepository : BaseRepository<ReviewReply>, IReviewReplyRepository
    {
        public ReviewReplyRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<int> CountRepliesAsync(Guid reviewId, CancellationToken cancellationToken = default)
        {

            return await _context.ReviewReplies
                .CountAsync(rr => rr.ReviewId == reviewId, cancellationToken);
        }

        public async Task<ReviewReply?> GetReplyWithUserAsync(Guid replyId, CancellationToken cancellationToken = default)
        {

            return await _context.ReviewReplies
                .Include(rr => rr.User)
                .FirstOrDefaultAsync(rr => rr.Id == replyId, cancellationToken);
        }

        public async Task<List<ReviewReply>> GetReviewRepliesAsync(Guid reviewId, CancellationToken cancellationToken = default)
        {

            return await _context.ReviewReplies
                .Where(rr => rr.ReviewId == reviewId)
                .OrderByDescending(rr => rr.Date)
                .ToListAsync(cancellationToken);
        }

        public async Task<bool> IsLikedByUserAsync(Guid reviewReplyId, Guid userId, CancellationToken cancellationToken = default)
        {

            return await _context.ReviewReplyLikes
                .AnyAsync(rl => rl.ReviewReplyId == reviewReplyId && rl.UserId == userId, cancellationToken);
        }
    }
}


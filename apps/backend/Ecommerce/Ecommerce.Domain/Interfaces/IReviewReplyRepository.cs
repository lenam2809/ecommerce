using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces.Base;

namespace Ecommerce.Domain.Interfaces
{
    public interface IReviewReplyRepository : IRepository<ReviewReply>
    {
        Task<List<ReviewReply>> GetReviewRepliesAsync(Guid reviewId, CancellationToken cancellationToken = default);
        Task<int> CountRepliesAsync(Guid reviewId, CancellationToken cancellationToken = default);
        Task<bool> IsLikedByUserAsync(Guid reviewReplyId, Guid userId, CancellationToken cancellationToken = default);
        Task<ReviewReply?> GetReplyWithUserAsync(Guid replyId, CancellationToken cancellationToken = default);
    }
}


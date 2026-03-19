using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces.Base;

namespace Ecommerce.Domain.Interfaces
{
    public interface IReviewLikeRepository : IRepository<ReviewLike>
    {
        Task<ReviewLike?> GetByUserAndReviewAsync(Guid userId, Guid reviewId);
    }
}


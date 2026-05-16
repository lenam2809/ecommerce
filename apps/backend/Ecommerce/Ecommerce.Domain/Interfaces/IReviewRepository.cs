using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces.Base;

namespace Ecommerce.Domain.Interfaces
{
    public interface IReviewRepository : IRepository<Review>
    {
        Task<ProductReviews> GetProductReviewsAsync(Guid productId);
        Task<double> GetAverageRatingAsync(Guid productId);
        Task<bool> ExistsForProductByUserAsync(Guid productId, Guid userId, CancellationToken cancellationToken = default);
        Task<bool> HasDeliveredPurchaseAsync(Guid productId, Guid userId, CancellationToken cancellationToken = default);
        Task<(double Rating, int Count)> GetRatingSummaryAsync(Guid productId, CancellationToken cancellationToken = default);
    }
}


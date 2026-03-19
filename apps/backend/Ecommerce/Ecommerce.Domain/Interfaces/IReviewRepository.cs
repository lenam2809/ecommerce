using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces.Base;

namespace Ecommerce.Domain.Interfaces
{
    public interface IReviewRepository : IRepository<Review>
    {
        Task<ProductReviews> GetProductReviewsAsync(Guid productId);
        Task<double> GetAverageRatingAsync(Guid productId);
    }
}


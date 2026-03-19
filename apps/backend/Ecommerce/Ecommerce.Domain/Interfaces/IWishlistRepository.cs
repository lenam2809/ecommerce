using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces.Base;

namespace Ecommerce.Domain.Interfaces
{
    public interface IWishlistRepository : IRepository<Wishlist>
    {
        Task<Wishlist> GetUserWishlistWithItems(Guid userId, CancellationToken cancellationToken);

        Task<bool> IsProductInAnyWishlistAsync(Guid productId, CancellationToken cancellationToken);
    }
}


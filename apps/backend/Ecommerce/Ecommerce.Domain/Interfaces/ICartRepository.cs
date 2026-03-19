using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces.Base;

namespace Ecommerce.Domain.Interfaces
{
    public interface ICartRepository : IRepository<Cart>
    {
        Task<Cart> GetCartAsync(Guid userId, CancellationToken cancellationToken = default);
        Task<Cart> AddToCartAsync(Guid userId, Guid productId, int quantity, string color, string size, CancellationToken cancellationToken = default);
        Task<Cart> UpdateCartItemAsync(Guid userId, Guid itemId, int quantity, CancellationToken cancellationToken = default);
        Task<Cart> RemoveCartItemAsync(Guid userId, Guid itemId, CancellationToken cancellationToken = default);
        Task<Cart> ClearCartAsync(Guid userId, CancellationToken cancellationToken = default);
        Task<Cart> ApplyPromoCodeAsync(Guid userId, string code, CancellationToken cancellationToken = default);
    }
}


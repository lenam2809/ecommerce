using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces.Base;

namespace Ecommerce.Domain.Interfaces
{
    public interface IOrderItemRepository : IRepository<OrderItem>
    {
        Task<List<OrderItem>> GetByOrderIdAsync(Guid orderId, CancellationToken cancellationToken = default);
        Task<List<OrderItem>> GetByProductIdAsync(Guid productId, CancellationToken cancellationToken = default);

        Task<int> GetTotalSoldQuantityAsync(Guid productId, CancellationToken cancellationToken = default);

    }
}


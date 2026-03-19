using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces.Base;

namespace Ecommerce.Domain.Interfaces
{
    public interface IOrderRepository : IRepository<Order>
    {
        Task<IEnumerable<Order>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
        Task<Order> GetOrderWithItemsAsync(Guid id, CancellationToken cancellationToken = default);
        Task<Order> GetOrderWithItemsAndProductsAsync(Guid id, CancellationToken cancellationToken = default);

    }
}


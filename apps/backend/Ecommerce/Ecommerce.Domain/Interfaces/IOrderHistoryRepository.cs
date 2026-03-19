using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces.Base;

namespace Ecommerce.Domain.Interfaces
{
    public interface IOrderHistoryRepository : IRepository<OrderHistory>
    {
        Task<IEnumerable<OrderHistory>> GetByOrderIdAsync(Guid orderId, CancellationToken cancellationToken = default);
        Task<IEnumerable<OrderHistory>> GetByUserAsync(Guid userId, CancellationToken cancellationToken = default);
        Task<OrderHistory> GetLatestByOrderIdAsync(Guid orderId, CancellationToken cancellationToken = default);
        Task<IEnumerable<OrderHistory>> GetOrderHistoryWithPaginationAsync(Guid orderId, int pageNumber, int pageSize, CancellationToken cancellationToken = default);
    }
}


using Ecommerce.Domain.Entities;

namespace Ecommerce.Application.Common.Interfaces
{
    public interface IOrderHistoryService
    {
        Task RecordStatusChangeAsync(Order originalOrder, Order updatedOrder, string changedBy, string changeSource = "Manual", string? notes = null, CancellationToken cancellationToken = default);
        Task RecordOrderUpdateAsync(Order originalOrder, Order updatedOrder, string changedBy, string changeSource = "Manual", string? notes = null, CancellationToken cancellationToken = default);
        Task RecordOrderCreationAsync(Order order, string changedBy, string changeSource = "System", CancellationToken cancellationToken = default);
        Task<IEnumerable<OrderHistory>> GetOrderHistoryAsync(Guid orderId, CancellationToken cancellationToken = default);
    }
}


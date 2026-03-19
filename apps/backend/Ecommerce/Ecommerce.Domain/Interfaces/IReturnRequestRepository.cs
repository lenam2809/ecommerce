using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces.Base;

namespace Ecommerce.Domain.Interfaces
{
    public interface IReturnRequestRepository : IRepository<ReturnRequest>
    {
        Task<ReturnRequest?> GetByCodeAsync(string code, CancellationToken ct = default);
        Task<ReturnRequest?> GetWithDetailsAsync(Guid id, CancellationToken ct = default);
        Task<IReadOnlyList<ReturnRequest>> GetByCustomerIdAsync(Guid customerId, CancellationToken ct = default);
        Task<IReadOnlyList<ReturnRequest>> GetByOrderIdAsync(Guid orderId, CancellationToken ct = default);
        Task<IReadOnlyList<ReturnRequest>> GetByStatusAsync(EReturnStatus status, CancellationToken ct = default);
    }
}

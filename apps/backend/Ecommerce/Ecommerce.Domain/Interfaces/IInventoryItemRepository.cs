using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces.Base;

namespace Ecommerce.Domain.Interfaces
{
    public interface IInventoryItemRepository : IRepository<InventoryItem>
    {
        Task<InventoryItem?> GetBySerialNumberAsync(string serialNumber, CancellationToken ct = default);
        Task<IReadOnlyList<InventoryItem>> GetBySkuIdAsync(Guid skuId, CancellationToken ct = default);
        Task<IReadOnlyList<InventoryItem>> GetAvailableBySkuIdAsync(Guid skuId, int quantity, CancellationToken ct = default);
        Task<IReadOnlyList<InventoryItem>> GetByStatusAsync(EInventoryStatus status, CancellationToken ct = default);
        Task<IReadOnlyList<InventoryItem>> GetByOrderItemIdAsync(Guid orderItemId, CancellationToken ct = default);
    }
}

using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Infrastructure.Persistence.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Infrastructure.Persistence.Repositories
{
    public class InventoryItemRepository : BaseRepository<InventoryItem>, IInventoryItemRepository
    {
        public InventoryItemRepository(ApplicationDbContext context) : base(context) { }

        public async Task<InventoryItem?> GetBySerialNumberAsync(string serialNumber, CancellationToken ct = default)
        {
            return await _context.InventoryItems
                .FirstOrDefaultAsync(i => i.SerialNumber == serialNumber, ct);
        }

        public async Task<IReadOnlyList<InventoryItem>> GetBySkuIdAsync(Guid skuId, CancellationToken ct = default)
        {
            return await _context.InventoryItems
                .Where(i => i.ProductVariantSkuId == skuId)
                .OrderBy(i => i.ImportedAt)
                .ToListAsync(ct);
        }

        public async Task<IReadOnlyList<InventoryItem>> GetAvailableBySkuIdAsync(Guid skuId, int quantity, CancellationToken ct = default)
        {
            return await _context.InventoryItems
                .Where(i => i.ProductVariantSkuId == skuId && i.Status == EInventoryStatus.Available)
                .OrderBy(i => i.ImportedAt)
                .Take(quantity)
                .ToListAsync(ct);
        }

        public async Task<IReadOnlyList<InventoryItem>> GetByStatusAsync(EInventoryStatus status, CancellationToken ct = default)
        {
            return await _context.InventoryItems
                .Where(i => i.Status == status)
                .ToListAsync(ct);
        }

        public async Task<IReadOnlyList<InventoryItem>> GetByOrderItemIdAsync(Guid orderItemId, CancellationToken ct = default)
        {
            return await _context.InventoryItems
                .Where(i => i.OrderItemId == orderItemId)
                .ToListAsync(ct);
        }
    }
}

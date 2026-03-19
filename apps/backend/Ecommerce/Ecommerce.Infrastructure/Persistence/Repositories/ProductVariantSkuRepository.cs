using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Infrastructure.Persistence.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Infrastructure.Persistence.Repositories
{
    public class ProductVariantSkuRepository : BaseRepository<ProductVariantSku>, IProductVariantSkuRepository
    {
        public ProductVariantSkuRepository(ApplicationDbContext context) : base(context) { }

        public async Task<ProductVariantSku?> GetBySkuAsync(string sku, CancellationToken ct = default)
        {
            return await _context.ProductVariantSkus
                .Include(s => s.AttributeValues)
                    .ThenInclude(av => av.ProductAttributeValue)
                .FirstOrDefaultAsync(s => s.Sku == sku, ct);
        }

        public async Task<IReadOnlyList<ProductVariantSku>> GetByProductIdAsync(Guid productId, CancellationToken ct = default)
        {
            return await _context.ProductVariantSkus
                .Where(s => s.ProductId == productId)
                .Include(s => s.AttributeValues)
                    .ThenInclude(av => av.ProductAttributeValue)
                .OrderBy(s => s.Price)
                .ToListAsync(ct);
        }

        public async Task<ProductVariantSku?> GetWithInventoryAsync(Guid skuId, CancellationToken ct = default)
        {
            return await _context.ProductVariantSkus
                .Include(s => s.InventoryItems)
                .FirstOrDefaultAsync(s => s.Id == skuId, ct);
        }
    }
}

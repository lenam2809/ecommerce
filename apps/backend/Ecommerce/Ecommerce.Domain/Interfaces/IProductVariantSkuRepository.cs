using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces.Base;

namespace Ecommerce.Domain.Interfaces
{
    public interface IProductVariantSkuRepository : IRepository<ProductVariantSku>
    {
        Task<ProductVariantSku?> GetBySkuAsync(string sku, CancellationToken ct = default);
        Task<IReadOnlyList<ProductVariantSku>> GetByProductIdAsync(Guid productId, CancellationToken ct = default);
        Task<ProductVariantSku?> GetWithInventoryAsync(Guid skuId, CancellationToken ct = default);
    }
}

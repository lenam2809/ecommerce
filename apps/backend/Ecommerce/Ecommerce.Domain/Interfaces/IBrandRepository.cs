using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces.Base;

namespace Ecommerce.Domain.Interfaces
{
    public interface IBrandRepository : IRepository<Brand>
    {
        Task<bool> ExistsAsync(Guid id, CancellationToken cancellationToken = default);
        Task<List<Guid>> ExistIdsAsync(List<Guid> ids, CancellationToken cancellationToken);
        Task<bool> IsCodeUniqueAsync(string code, Guid? id = null, CancellationToken cancellationToken = default);

        Task<int> CountProductsByBrandIdAsync(Guid id, CancellationToken cancellationToken = default);

        Task<Brand?> GetBrandByNameAsync(string name, CancellationToken cancellationToken = default);
        Task<bool> HasProductsAsync(Guid id, CancellationToken cancellationToken);
    }
}


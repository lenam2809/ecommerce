using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces.Base;

namespace Ecommerce.Domain.Interfaces
{
    public interface ICategoryRepository : IRepository<Category>
    {
        Task<List<Category>> GetTopCategoriesByPurchaseCount(int limit, CancellationToken cancellationToken = default);


        Task<bool> IsCodeUniqueAsync(string code, Guid? id = null, CancellationToken cancellationToken = default);

        Task<bool> ExistsAsync(Guid id, CancellationToken cancellationToken = default);
        Task<List<Guid>> ExistIdsAsync(List<Guid> ids, CancellationToken cancellationToken = default);

        Task<bool> HasChildrenAsync(Guid id, CancellationToken cancellationToken = default);

        Task<bool> HasProductsAsync(Guid id, CancellationToken cancellationToken = default);
        Task<int> CountProductsByCategoryIdAsync(Guid id, CancellationToken cancellationToken = default);

        Task<Category> GetCategoryByNameAsync(string name, CancellationToken cancellationToken = default);


    }
}


using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces.Base;

namespace Ecommerce.Domain.Interfaces
{
    public interface ICustomerAddressRepository : IRepository<CustomerAddress>
    {
        Task<List<CustomerAddress>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
        Task<CustomerAddress> GetDefaultAddressByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
        Task<bool> SetDefaultAddressAsync(Guid addressId, Guid userId, CancellationToken cancellationToken = default);
        Task<bool> ExistsAsync(Guid id, CancellationToken cancellationToken = default);
        Task<bool> UserOwnsAddressAsync(Guid addressId, Guid userId, CancellationToken cancellationToken = default);
        Task<int> CountByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    }
}


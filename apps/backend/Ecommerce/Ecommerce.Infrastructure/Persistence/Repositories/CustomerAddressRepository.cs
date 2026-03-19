using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Infrastructure.Persistence.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Infrastructure.Persistence.Repositories
{
    public class CustomerAddressRepository : BaseRepository<CustomerAddress>, ICustomerAddressRepository
    {
        public CustomerAddressRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<List<CustomerAddress>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
        {
            return await _context.CustomerAddresses
                .Where(a => a.ApplicationUserId == userId)
                .OrderByDescending(a => a.IsDefault)
                .ThenBy(a => a.CreatedAt)
                .ToListAsync(cancellationToken);
        }

        public async Task<CustomerAddress> GetDefaultAddressByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
        {
            return await _context.CustomerAddresses
                .FirstOrDefaultAsync(a => a.ApplicationUserId == userId && a.IsDefault, cancellationToken);
        }

        public async Task<bool> SetDefaultAddressAsync(Guid addressId, Guid userId, CancellationToken cancellationToken = default)
        {
            // Reset all addresses for user to non-default
            await _context.CustomerAddresses
                .Where(a => a.ApplicationUserId == userId)
                .ExecuteUpdateAsync(x => x.SetProperty(a => a.IsDefault, false), cancellationToken);

            // Set new default address
            await _context.CustomerAddresses
                .Where(a => a.Id == addressId && a.ApplicationUserId == userId)
                .ExecuteUpdateAsync(x => x.SetProperty(a => a.IsDefault, true), cancellationToken);

            return true;
        }

        public async Task<bool> ExistsAsync(Guid id, CancellationToken cancellationToken = default)
        {
            return await _context.CustomerAddresses.AnyAsync(a => a.Id == id, cancellationToken);
        }

        public async Task<bool> UserOwnsAddressAsync(Guid addressId, Guid userId, CancellationToken cancellationToken = default)
        {
            return await _context.CustomerAddresses
                .AnyAsync(a => a.Id == addressId && a.ApplicationUserId == userId, cancellationToken);
        }

        public async Task<int> CountByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
        {
            return await _context.CustomerAddresses
                .CountAsync(a => a.ApplicationUserId == userId, cancellationToken);
        }
    }
}


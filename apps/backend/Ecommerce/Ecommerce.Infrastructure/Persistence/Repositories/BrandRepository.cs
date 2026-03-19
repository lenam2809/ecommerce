using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Infrastructure.Persistence.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Infrastructure.Persistence.Repositories
{
    public class BrandRepository : BaseRepository<Brand>, IBrandRepository
    {
        public BrandRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<int> CountProductsByBrandIdAsync(Guid id, CancellationToken cancellationToken = default)
        {
            return await _context.Products.CountAsync(p => p.BrandId == id, cancellationToken);
        }

        public async Task<List<Guid>> ExistIdsAsync(List<Guid> ids, CancellationToken cancellationToken)
        {
            return await _context.Brands
                .Where(c => ids.Contains(c.Id))
                .Select(c => c.Id)
                .ToListAsync(cancellationToken);
        }

        public async Task<bool> ExistsAsync(Guid id, CancellationToken cancellationToken = default)
        {
            return await _context.Brands.AnyAsync(p => p.Id == id, cancellationToken);

        }

        public async Task<Brand?> GetBrandByNameAsync(string name, CancellationToken cancellationToken = default)
        {

            return await _context.Brands
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.Name == name, cancellationToken);
        }

        public async Task<bool> HasProductsAsync(Guid id, CancellationToken cancellationToken)
        {
            return await _context.Products
                .AnyAsync(p => p.BrandId == id, cancellationToken);
        }

        public async Task<bool> IsCodeUniqueAsync(string code, Guid? id = null, CancellationToken cancellationToken = default)
        {
            if (id.HasValue)
            {
                return !await _context.Brands.AnyAsync(p => p.Code == code && p.Id != id.Value, cancellationToken);
            }
            return !await _context.Brands.AnyAsync(p => p.Code == code, cancellationToken);
        }
    }
}


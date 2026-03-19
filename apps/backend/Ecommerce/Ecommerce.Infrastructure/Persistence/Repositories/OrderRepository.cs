using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Infrastructure.Persistence.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Infrastructure.Persistence.Repositories
{
    public class OrderRepository : BaseRepository<Order>, IOrderRepository
    {
        public OrderRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Order>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
        {
            return await _context.Orders
                .Where(o => o.ApplicationUserId == userId)
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
                .ToListAsync(cancellationToken);
        }

        public async Task<Order> GetOrderWithItemsAsync(Guid id, CancellationToken cancellationToken = default)
        {
            return await _context.Orders
                .Include(o => o.OrderItems)
                .FirstOrDefaultAsync(o => o.Id == id, cancellationToken);
        }

        public async Task<Order> GetOrderWithItemsAndProductsAsync(Guid id, CancellationToken cancellationToken = default)
        {
            return await _context.Orders
                .Include(o => o.OrderItems)
                    .ThenInclude(i => i.Product)
                .Include(o => o.ApplicationUser)
                .FirstOrDefaultAsync(o => o.Id == id, cancellationToken);
        }
    }
}


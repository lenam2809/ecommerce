using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Infrastructure.Persistence.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Infrastructure.Persistence.Repositories
{
    public class OrderHistoryRepository : BaseRepository<OrderHistory>, IOrderHistoryRepository
    {
        public OrderHistoryRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<OrderHistory>> GetByOrderIdAsync(Guid orderId, CancellationToken cancellationToken = default)
        {
            return await _context.OrderHistories
                .Where(oh => oh.OrderId == orderId)
                .Include(oh => oh.Order)
                .OrderByDescending(oh => oh.ChangedAt)
                .ToListAsync(cancellationToken);
        }

        public async Task<IEnumerable<OrderHistory>> GetByUserAsync(Guid userId, CancellationToken cancellationToken = default)
        {
            return await _context.OrderHistories
                .Include(oh => oh.Order)
                .Where(oh => oh.Order.ApplicationUserId == userId)
                .OrderByDescending(oh => oh.ChangedAt)
                .ToListAsync(cancellationToken);
        }

        public async Task<OrderHistory> GetLatestByOrderIdAsync(Guid orderId, CancellationToken cancellationToken = default)
        {
            return await _context.OrderHistories
                .Where(oh => oh.OrderId == orderId)
                .OrderByDescending(oh => oh.ChangedAt)
                .FirstOrDefaultAsync(cancellationToken);
        }

        public async Task<IEnumerable<OrderHistory>> GetOrderHistoryWithPaginationAsync(Guid orderId, int pageNumber, int pageSize, CancellationToken cancellationToken = default)
        {
            return await _context.OrderHistories
                .Where(oh => oh.OrderId == orderId)
                .Include(oh => oh.Order)
                .OrderByDescending(oh => oh.ChangedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);
        }
    }
}


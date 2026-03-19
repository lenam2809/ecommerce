using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Infrastructure.Persistence.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Infrastructure.Persistence.Repositories
{
    public class OrderItemRepository : BaseRepository<OrderItem>, IOrderItemRepository
    {
        public OrderItemRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<List<OrderItem>> GetByOrderIdAsync(Guid orderId, CancellationToken cancellationToken = default)
        {
            return await _context.OrderItems
                .Include(oi => oi.Product)
                .Where(oi => oi.OrderId == orderId)
                .ToListAsync(cancellationToken);
        }

        public async Task<List<OrderItem>> GetByProductIdAsync(Guid productId, CancellationToken cancellationToken = default)
        {
            return await _context.OrderItems
                .Include(oi => oi.Order)
                .Where(oi => oi.ProductId == productId)
                .ToListAsync(cancellationToken);
        }

        public async Task<int> GetTotalSoldQuantityAsync(Guid productId, CancellationToken cancellationToken = default)
        {
            return await _context.OrderItems
                 .Where(oi => oi.ProductId == productId)
                 .SumAsync(oi => oi.Quantity, cancellationToken);
        }
    }
}


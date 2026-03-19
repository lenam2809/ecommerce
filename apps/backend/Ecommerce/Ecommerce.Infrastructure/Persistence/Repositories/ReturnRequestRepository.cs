using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Infrastructure.Persistence.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Infrastructure.Persistence.Repositories
{
    public class ReturnRequestRepository : BaseRepository<ReturnRequest>, IReturnRequestRepository
    {
        public ReturnRequestRepository(ApplicationDbContext context) : base(context) { }

        public async Task<ReturnRequest?> GetByCodeAsync(string code, CancellationToken ct = default)
        {
            return await _context.ReturnRequests
                .Include(r => r.Evidences)
                .Include(r => r.StatusHistory)
                .FirstOrDefaultAsync(r => r.Code == code, ct);
        }

        public async Task<ReturnRequest?> GetWithDetailsAsync(Guid id, CancellationToken ct = default)
        {
            return await _context.ReturnRequests
                .Include(r => r.Evidences)
                .Include(r => r.StatusHistory.OrderByDescending(h => h.ChangedAt))
                .Include(r => r.Order)
                .Include(r => r.Customer)
                .FirstOrDefaultAsync(r => r.Id == id, ct);
        }

        public async Task<IReadOnlyList<ReturnRequest>> GetByCustomerIdAsync(Guid customerId, CancellationToken ct = default)
        {
            return await _context.ReturnRequests
                .Where(r => r.CustomerId == customerId)
                .Include(r => r.StatusHistory)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync(ct);
        }

        public async Task<IReadOnlyList<ReturnRequest>> GetByOrderIdAsync(Guid orderId, CancellationToken ct = default)
        {
            return await _context.ReturnRequests
                .Where(r => r.OrderId == orderId)
                .Include(r => r.Evidences)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync(ct);
        }

        public async Task<IReadOnlyList<ReturnRequest>> GetByStatusAsync(EReturnStatus status, CancellationToken ct = default)
        {
            return await _context.ReturnRequests
                .Where(r => r.Status == status)
                .Include(r => r.Order)
                .Include(r => r.Customer)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync(ct);
        }
    }
}

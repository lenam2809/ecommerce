using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Infrastructure.Persistence.Repositories.Base;

namespace Ecommerce.Infrastructure.Persistence.Repositories
{
    public class AuditLogRepository : BaseRepository<AuditLog>, IAuditLogRepository
    {
        public AuditLogRepository(ApplicationDbContext context) : base(context)
        {
        }
    }
}


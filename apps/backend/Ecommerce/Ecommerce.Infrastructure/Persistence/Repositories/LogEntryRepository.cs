using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Infrastructure.Persistence.Repositories.Base;

namespace Ecommerce.Infrastructure.Persistence.Repositories
{
    public class LogEntryRepository : BaseRepository<LogEntry>, ILogEntryRepository
    {
        public LogEntryRepository(ApplicationDbContext context) : base(context)
        {
        }
    }
}


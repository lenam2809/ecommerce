using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Infrastructure.Persistence.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Infrastructure.Persistence.Repositories
{
    public class MarqueeRepository : BaseRepository<MarqueeMessage>, IMarqueeRepository
    {
        private readonly ApplicationDbContext _ctx;

        public MarqueeRepository(ApplicationDbContext context) : base(context)
        {
            _ctx = context;
        }

        public Task<MarqueeSetting?> GetSettingAsync(CancellationToken cancellationToken = default)
            => _ctx.MarqueeSettings.FirstOrDefaultAsync(cancellationToken);

        public async Task SaveSettingAsync(MarqueeSetting setting, CancellationToken cancellationToken = default)
        {
            var exists = await _ctx.MarqueeSettings.AnyAsync(s => s.Id == setting.Id, cancellationToken);
            if (exists)
                _ctx.MarqueeSettings.Update(setting);
            else
                await _ctx.MarqueeSettings.AddAsync(setting, cancellationToken);
        }

        public async Task AddAuditLogAsync(MarqueeAuditLog log, CancellationToken cancellationToken = default)
        {
            await _ctx.MarqueeAuditLogs.AddAsync(log, cancellationToken);
        }
    }
}

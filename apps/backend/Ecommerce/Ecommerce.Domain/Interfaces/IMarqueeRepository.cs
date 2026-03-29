using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces.Base;

namespace Ecommerce.Domain.Interfaces
{
    public interface IMarqueeRepository : IRepository<MarqueeMessage>
    {
        Task<MarqueeSetting?> GetSettingAsync(CancellationToken cancellationToken = default);
        Task SaveSettingAsync(MarqueeSetting setting, CancellationToken cancellationToken = default);
        Task AddAuditLogAsync(MarqueeAuditLog log, CancellationToken cancellationToken = default);
    }
}

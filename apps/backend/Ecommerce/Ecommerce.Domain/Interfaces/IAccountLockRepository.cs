using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces.Base;

namespace Ecommerce.Domain.Interfaces
{
    public interface IAccountLockRepository : IRepository<AccountLock>
    {
        Task<AccountLock> GetActiveLockAsync(Guid userId);
        Task<bool> IsUserLockedAsync(Guid userId);
        Task<AccountLock> LockUserAsync(Guid userId, string reason, ELockType lockType, DateTime? expiresAt = null, Guid? lockedByUserId = null, string? notes = null);
        Task<bool> UnlockUserAsync(Guid userId, Guid? unlockedByUserId = null);
        Task<IEnumerable<AccountLock>> GetExpiredLocksAsync();
        Task ProcessExpiredLocksAsync();
    }
}


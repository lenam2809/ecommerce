using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;

namespace Ecommerce.Application.Common.Interfaces
{
    public interface IAccountLockService
    {
        Task<bool> IsUserLockedAsync(Guid userId);
        Task<AccountLock> LockUserAsync(Guid userId, string reason, ELockType lockType, int? durationMinutes = null, string? notes = null);
        Task<bool> UnlockUserAsync(Guid userId);
        Task<AccountLock> GetActiveLockAsync(Guid userId);
        Task ProcessExpiredLocksAsync(); // Background service để tự động mở khóa
    }
}


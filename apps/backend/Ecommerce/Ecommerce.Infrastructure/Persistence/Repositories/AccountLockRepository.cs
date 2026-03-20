using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Infrastructure.Persistence.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Infrastructure.Persistence.Repositories
{
    public class AccountLockRepository : BaseRepository<AccountLock>, IAccountLockRepository
    {
        public AccountLockRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<AccountLock> GetActiveLockAsync(Guid userId)
        {
            return await _context.AccountLocks
                .Where(al => al.UserId == userId && al.IsActive)
                .Include(al => al.User)
                .Include(al => al.LockedByUser)
                .Include(al => al.UnlockedByUser)
                .FirstOrDefaultAsync();
        }

        public async Task<bool> IsUserLockedAsync(Guid userId)
        {
            var activeLock = await GetActiveLockAsync(userId);

            if (activeLock == null) return false;

            // Kiểm tra xem lock có hết hạn chưa
            if (activeLock.ExpiresAt.HasValue && activeLock.ExpiresAt.Value <= DateTime.Now)
            {
                // Tự động mở khóa nếu hết hạn
                activeLock.IsActive = false;
                activeLock.UnlockedAt = DateTime.Now;
                _context.AccountLocks.Update(activeLock);
                return false;
            }

            return true;
        }

        public async Task<AccountLock> LockUserAsync(Guid userId, string reason, ELockType lockType, DateTime? expiresAt = null, Guid? lockedByUserId = null, string? notes = null)
        {
            // Vô hiệu hóa các lock cũ
            var existingLocks = await _context.AccountLocks
                .Where(al => al.UserId == userId && al.IsActive)
                .ToListAsync();

            foreach (var existingLock in existingLocks)
            {
                existingLock.IsActive = false;
            }

            // Tạo lock mới
            var newLock = new AccountLock
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Reason = reason,
                LockType = lockType,
                LockedAt = DateTime.Now,
                ExpiresAt = expiresAt,
                IsActive = true,
                LockedByUserId = lockedByUserId,
                Notes = notes
            };

            await _context.AccountLocks.AddAsync(newLock);
            return newLock;
        }

        public async Task<bool> UnlockUserAsync(Guid userId, Guid? unlockedByUserId = null)
        {
            var activeLock = await GetActiveLockAsync(userId);
            if (activeLock == null) return false;

            activeLock.IsActive = false;
            activeLock.UnlockedAt = DateTime.Now;
            activeLock.UnlockedByUserId = unlockedByUserId;

            _context.AccountLocks.Update(activeLock);
            return true;
        }

        public async Task<IEnumerable<AccountLock>> GetExpiredLocksAsync()
        {
            return await _context.AccountLocks
                .Where(al => al.IsActive &&
                           al.ExpiresAt.HasValue &&
                           al.ExpiresAt.Value <= DateTime.Now)
                .ToListAsync();
        }

        public async Task ProcessExpiredLocksAsync()
        {
            var expiredLocks = await GetExpiredLocksAsync();

            foreach (var expiredLock in expiredLocks)
            {
                expiredLock.IsActive = false;
                expiredLock.UnlockedAt = DateTime.Now;
            }

            if (expiredLocks.Any())
            {
                _context.AccountLocks.UpdateRange(expiredLocks);
            }
        }
    }
}


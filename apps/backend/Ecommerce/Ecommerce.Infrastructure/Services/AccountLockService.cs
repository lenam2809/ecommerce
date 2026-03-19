using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces;

namespace Ecommerce.Infrastructure.Services
{
    public class AccountLockService : IAccountLockService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICurrentUserService _currentUserService;
        private readonly IUserActivityService _userActivityService;

        public AccountLockService(
            IUnitOfWork unitOfWork,
            ICurrentUserService currentUserService,
            IUserActivityService userActivityService)
        {
            _unitOfWork = unitOfWork;
            _currentUserService = currentUserService;
            _userActivityService = userActivityService;
        }

        public async Task<bool> IsUserLockedAsync(Guid userId)
        {
            return await _unitOfWork.AccountLocks.IsUserLockedAsync(userId);
        }

        public async Task<AccountLock> LockUserAsync(Guid userId, string reason, ELockType lockType, int? durationMinutes = null, string notes = null)
        {
            DateTime? expiresAt = null;
            if (durationMinutes.HasValue && lockType == ELockType.Temporary)
            {
                expiresAt = DateTime.Now.AddMinutes(durationMinutes.Value);
            }

            var currentUserId = _currentUserService.UserId;

            var accountLock = await _unitOfWork.AccountLocks.LockUserAsync(
                userId, reason, lockType, expiresAt, currentUserId, notes);

            await _unitOfWork.CompleteAsync();

            // Log activity
            await _userActivityService.LogActivityAsync(
                "AccountLocked",
                $"Tài khoản bị khóa: {reason}",
                new { LockType = lockType.ToString(), ExpiresAt = expiresAt, Reason = reason });

            return accountLock;
        }

        public async Task<bool> UnlockUserAsync(Guid userId)
        {
            var currentUserId = _currentUserService.UserId;
            var result = await _unitOfWork.AccountLocks.UnlockUserAsync(userId, currentUserId);

            if (result)
            {
                await _unitOfWork.CompleteAsync();

                // Log activity
                await _userActivityService.LogActivityAsync(
                    "AccountUnlocked",
                    "Tài khoản đã được mở khóa");
            }

            return result;
        }

        public async Task<AccountLock> GetActiveLockAsync(Guid userId)
        {
            return await _unitOfWork.AccountLocks.GetActiveLockAsync(userId);
        }

        public async Task ProcessExpiredLocksAsync()
        {
            await _unitOfWork.AccountLocks.ProcessExpiredLocksAsync();
            await _unitOfWork.CompleteAsync();
        }
    }
}


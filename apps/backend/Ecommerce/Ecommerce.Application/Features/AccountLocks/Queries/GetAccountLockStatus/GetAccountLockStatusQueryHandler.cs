using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.AccountLocks.Dto;
using MediatR;

namespace Ecommerce.Application.Features.AccountLocks.Queries.GetAccountLockStatus
{
    public class GetAccountLockStatusQueryHandler : IRequestHandler<GetAccountLockStatusQuery, Result<AccountLockDto>>
    {
        private readonly IAccountLockService _accountLockService;

        public GetAccountLockStatusQueryHandler(IAccountLockService accountLockService)
        {
            _accountLockService = accountLockService;
        }

        public async Task<Result<AccountLockDto>> Handle(GetAccountLockStatusQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var activeLock = await _accountLockService.GetActiveLockAsync(request.UserId);

                if (activeLock == null)
                {
                    return Result<AccountLockDto>.Success(null); // User không bị khóa
                }

                var lockDto = new AccountLockDto
                {
                    Id = activeLock.Id,
                    UserId = activeLock.UserId,
                    UserName = activeLock.User?.UserName,
                    UserEmail = activeLock.User?.Email,
                    Reason = activeLock.Reason,
                    LockType = activeLock.LockType,
                    LockTypeText = activeLock.LockType.ToString(),
                    LockedAt = activeLock.LockedAt,
                    UnlockedAt = activeLock.UnlockedAt,
                    ExpiresAt = activeLock.ExpiresAt,
                    IsActive = activeLock.IsActive,
                    LockedByUserName = activeLock.LockedByUser?.UserName,
                    UnlockedByUserName = activeLock.UnlockedByUser?.UserName,
                    Notes = activeLock.Notes,
                    RemainingMinutes = activeLock.ExpiresAt.HasValue && activeLock.IsActive
                        ? Math.Max(0, (int)(activeLock.ExpiresAt.Value - DateTime.Now).TotalMinutes)
                        : null
                };

                return Result<AccountLockDto>.Success(lockDto);
            }
            catch (Exception ex)
            {
                return Result<AccountLockDto>.BadRequest(ex.Message);
            }
        }
    }
}


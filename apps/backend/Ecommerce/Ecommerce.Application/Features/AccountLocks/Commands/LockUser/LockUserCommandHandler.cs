using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces.Logging;
using MediatR;

namespace Ecommerce.Application.Features.AccountLocks.Commands.LockUser
{
    public class LockUserCommandHandler : IRequestHandler<LockUserCommand, Result<bool>>
    {
        private readonly ICurrentUserService _currentUserService;
        private readonly IAccountLockService _accountLockService;
        private readonly IEnhancedLogger _logger;

        public LockUserCommandHandler(
            ICurrentUserService currentUserService,
            IAccountLockService accountLockService,
            IEnhancedLogger logger)
        {
            _currentUserService = currentUserService;
            _accountLockService = accountLockService;
            _logger = logger;
        }

        public async Task<Result<bool>> Handle(LockUserCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var isAdmin = await _currentUserService.IsInRoleAsync(EUserRoles.Admin);
                if (!isAdmin)
                {
                    return Result<bool>.Unauthorized("Chỉ Admin mới có quyền khóa tài khoản");
                }

                var isLocked = await _accountLockService.IsUserLockedAsync(request.UserId);
                if (isLocked)
                {
                    return Result<bool>.BadRequest("Tài khoản này đã bị khóa");
                }

                await _accountLockService.LockUserAsync(
                    request.UserId,
                    request.Reason,
                    request.LockType,
                    request.DurationMinutes,
                    request.Notes);

                await _logger.LogAsync(
                    ELogLevel.Information,
                    "Locked account {TargetUserId} with type {LockType}",
                    "AccountLockChanged",
                    ELogType.AccessControl,
                    new Dictionary<string, object?>
                    {
                        { "TargetUserId", request.UserId },
                        { "LockType", request.LockType.ToString() },
                        { "DurationMinutes", request.DurationMinutes },
                        { "Reason", request.Reason }
                    });

                return Result<bool>.Success(true);
            }
            catch (Exception ex)
            {
                return Result<bool>.BadRequest(ex.Message);
            }
        }
    }
}

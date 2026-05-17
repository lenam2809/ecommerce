using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces.Logging;
using MediatR;

namespace Ecommerce.Application.Features.AccountLocks.Commands.UnlockUser
{
    public class UnlockUserCommandHandler : IRequestHandler<UnlockUserCommand, Result<bool>>
    {
        private readonly ICurrentUserService _currentUserService;
        private readonly IAccountLockService _accountLockService;
        private readonly IEnhancedLogger _logger;

        public UnlockUserCommandHandler(
            IAccountLockService accountLockService,
            ICurrentUserService currentUserService,
            IEnhancedLogger logger)
        {
            _accountLockService = accountLockService;
            _currentUserService = currentUserService;
            _logger = logger;
        }

        public async Task<Result<bool>> Handle(UnlockUserCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var isAdmin = await _currentUserService.IsInRoleAsync(EUserRoles.Admin);
                if (!isAdmin)
                {
                    return Result<bool>.Unauthorized("Chỉ Admin mới có quyền mở khóa tài khoản");
                }

                await _accountLockService.UnlockUserAsync(request.UserId);

                await _logger.LogAsync(
                    ELogLevel.Information,
                    "Unlocked account {TargetUserId}",
                    "AccountLockChanged",
                    ELogType.AccessControl,
                    new Dictionary<string, object?>
                    {
                        { "TargetUserId", request.UserId }
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

using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using MediatR;

namespace Ecommerce.Application.Features.AccountLocks.Commands.LockUser
{
    public class LockUserCommandHandler : IRequestHandler<LockUserCommand, Result<bool>>
    {
        private readonly ICurrentUserService _currentUserService;
        private readonly IAccountLockService _accountLockService;

        public LockUserCommandHandler(
            ICurrentUserService currentUserService,
            IAccountLockService accountLockService)
        {
            _currentUserService = currentUserService;
            _accountLockService = accountLockService;
        }

        public async Task<Result<bool>> Handle(LockUserCommand request, CancellationToken cancellationToken)
        {
            try
            {
                // Kiểm tra quyền Admin
                var isAdmin = await _currentUserService.IsInRoleAsync("Admin");
                if (!isAdmin)
                {
                    return Result<bool>.Unauthorized("Chỉ Admin mới có quyền khóa tài khoản");
                }

                // Kiểm tra user có đang bị khóa không
                var isLocked = await _accountLockService.IsUserLockedAsync(request.UserId);
                if (isLocked)
                {
                    return Result<bool>.BadRequest("Tài khoản này đã bị khóa");
                }

                // Thực hiện khóa
                await _accountLockService.LockUserAsync(
                    request.UserId,
                    request.Reason,
                    request.LockType,
                    request.DurationMinutes,
                    request.Notes);

                return Result<bool>.Success(true);
            }
            catch (Exception ex)
            {
                return Result<bool>.BadRequest(ex.Message);
            }
        }
    }
}


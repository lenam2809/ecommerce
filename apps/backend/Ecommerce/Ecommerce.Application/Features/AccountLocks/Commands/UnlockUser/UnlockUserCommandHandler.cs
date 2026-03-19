using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using MediatR;

namespace Ecommerce.Application.Features.AccountLocks.Commands.UnlockUser
{
    public class UnlockUserCommandHandler : IRequestHandler<UnlockUserCommand, Result<bool>>
    {
        private readonly ICurrentUserService _currentUserService;
        private readonly IAccountLockService _accountLockService;

        public UnlockUserCommandHandler(
            IAccountLockService accountLockService,
            ICurrentUserService currentUserService)
        {
            _accountLockService = accountLockService;
            _currentUserService = currentUserService;
        }

        public async Task<Result<bool>> Handle(UnlockUserCommand request, CancellationToken cancellationToken)
        {
            try
            {
                // Kiểm tra quyền Admin
                var isAdmin = await _currentUserService.IsInRoleAsync("Admin");
                if (!isAdmin)
                {
                    return Result<bool>.Unauthorized("Chỉ Admin mới có quyền mở khóa tài khoản");
                }

                // Thực hiện mở khóa
                await _accountLockService.UnlockUserAsync(
                    request.UserId);

                return Result<bool>.Success(true);
            }
            catch (Exception ex)
            {
                return Result<bool>.BadRequest(ex.Message);
            }
        }
    }
}


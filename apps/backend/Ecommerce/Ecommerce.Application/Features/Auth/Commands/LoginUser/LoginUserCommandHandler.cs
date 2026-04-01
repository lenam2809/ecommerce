using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Auth.Dto;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Domain.Interfaces.Logging;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Application.Features.Auth.Commands.LoginUser
{
    public class LoginUserCommandHandler : IRequestHandler<LoginUserCommand, Result<AuthResponseDto>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ITokenService _tokenService;
        private readonly IFileStorageService _fileStorageService;
        private readonly IEnhancedLogger _logger;
        private readonly IUserActivityService _userActivityService;
        private readonly IMergeCartService _mergeCartService;
        private readonly ICurrentUserService _currentUserService;

        public LoginUserCommandHandler(IUnitOfWork unitOfWork,
            ITokenService tokenService,
            IFileStorageService fileStorageService,
            IEnhancedLogger logger,
            IUserActivityService userActivityService,
            IMergeCartService mergeCartService,
            ICurrentUserService currentUserService)
        {
            _unitOfWork = unitOfWork;
            _tokenService = tokenService;
            _fileStorageService = fileStorageService;
            _logger = logger;
            _userActivityService = userActivityService;
            _mergeCartService = mergeCartService;
            _currentUserService = currentUserService;
        }

        public async Task<Result<AuthResponseDto>> Handle(LoginUserCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var user = await _unitOfWork.Users.GetByEmailAsync(request.Email);
                if (user == null)
                {
                    return Result<AuthResponseDto>.BadRequest("Email hoặc mật khẩu không hợp lệ.");
                }

                // 1. Kiểm tra khóa tài khoản (Custom Lock)
                if (await _unitOfWork.AccountLocks.IsUserLockedAsync(user.Id))
                {
                    var activeLock = await _unitOfWork.AccountLocks.GetActiveLockAsync(user.Id);
                    return Result<AuthResponseDto>.BadRequest($"Tài khoản đã bị khóa. Lý do: {activeLock.Reason}. " +
                        (activeLock.ExpiresAt.HasValue ? $"Hết hạn lúc: {activeLock.ExpiresAt.Value}" : "Khóa vĩnh viễn."));
                }

                // 2. Kiểm tra mật khẩu
                var passwordValid = await _unitOfWork.Users.CheckPasswordAsync(user, request.Password);
                if (!passwordValid)
                {
                    await _unitOfWork.Users.AccessFailedAsync(user);
                    var failCount = await _unitOfWork.Users.GetAccessFailedCountAsync(user);

                    if (failCount >= 5)
                    {
                        var expiresAt = DateTime.Now.AddMinutes(30);
                        await _unitOfWork.AccountLocks.LockUserAsync(user.Id, "Đăng nhập sai quá nhiều lần", ELockType.Temporary, expiresAt);
                        user.AddDomainEvent(new Domain.Events.UserLockedEvent(user.Id, user.Email, "Đăng nhập sai quá nhiều lần", expiresAt));
                        await _unitOfWork.CompleteAsync(cancellationToken);
                        return Result<AuthResponseDto>.BadRequest("Tài khoản đã bị khóa do đăng nhập sai quá nhiều lần. Vui lòng thử lại sau 30 phút.");
                    }

                    return Result<AuthResponseDto>.BadRequest($"Email hoặc mật khẩu không hợp lệ. Còn {5 - failCount} lần thử.");
                }

                // 3. Đăng nhập thành công, reset số lần sai
                await _unitOfWork.Users.ResetAccessFailedCountAsync(user);

                var roles = await _unitOfWork.Users.GetRolesAsync(user);
                var permissions = await _unitOfWork.Users.GetPermissionsQuery(user)
                    .ToListAsync(cancellationToken: cancellationToken);
                var permissionNames = permissions.Select(p => p.Name).ToList();

                var accessToken = _tokenService.GenerateAccessToken(user, roles, permissionNames);
                var rawRefreshToken = _tokenService.GenerateRefreshToken();
                var refreshTokenHash = _tokenService.HashToken(rawRefreshToken);

                // Persist only the hash — raw token lives only in memory/cookie
                user.RefreshTokens.Add(new Domain.Entities.RefreshToken
                {
                    Token = refreshTokenHash, // kept for backward compat until column drop migration
                    TokenHash = refreshTokenHash,
                    ExpiryDate = DateTime.Now.AddDays(7),
                    IsRevoked = false
                });

                await _unitOfWork.Users.UpdateAsync(user);
                await _unitOfWork.CompleteAsync(cancellationToken);

                if (!string.IsNullOrEmpty(_currentUserService.GuestId))
                {
                    await _mergeCartService.MergeGuestCartToUserAsync(user.Id, _currentUserService.GuestId, cancellationToken);
                }

                var response = new AuthResponseDto
                {
                    UserId = user.Id,
                    Email = user.Email ?? "",
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    FullName = user.FullName,
                    PhoneNumber = user.PhoneNumber ?? "",
                    CustomerLevel = user.CustomerLevel,
                    Roles = [.. roles],
                    AccessToken = accessToken,
                    RefreshToken = rawRefreshToken, // raw token goes to cookie only
                    Permissions = permissionNames,
                    Avatar = await _fileStorageService.GetFileUrlAsync(user.Avatar)
                };

                await _logger.LogAsync(ELogLevel.Information,
                    $"Người dùng {user.Email} đã đăng nhập thành công.",
                    "Đăng nhập thành công");
                await _userActivityService.LogActivityAsync("Login", "Đăng nhập thành công", "", response.UserId);

                return Result<AuthResponseDto>.Success(response);
            }
            catch (Exception ex)
            {
                await _logger.LogExceptionAsync(ex, "Đã xảy ra lỗi khi đăng nhập");
                await _logger.LogAsync(ELogLevel.Information,
                    $"Người dùng {request.Email} đã đăng nhập thất bại.",
                    "Đăng nhập thất bại");
                return Result<AuthResponseDto>.BadRequest($"Lỗi khi đăng nhập: {ex.Message}");
            }
        }
    }
}

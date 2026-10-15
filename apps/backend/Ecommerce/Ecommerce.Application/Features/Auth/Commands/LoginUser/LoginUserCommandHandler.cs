using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Auth.Dto;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Domain.Interfaces.Logging;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;

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

        public LoginUserCommandHandler(
            IUnitOfWork unitOfWork,
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
                    // 🔒 SECURITY (M11): thông báo đồng nhất cho MỌI trường hợp thất bại —
                    // không để lộ tài khoản có tồn tại hay không (chống user enumeration)
                    return Result<AuthResponseDto>.BadRequest("Email hoặc mật khẩu không đúng.");
                }

                if (await _unitOfWork.AccountLocks.IsUserLockedAsync(user.Id))
                {
                    var activeLock = await _unitOfWork.AccountLocks.GetActiveLockAsync(user.Id);
                    await _logger.LogAsync(
                        ELogLevel.Warning,
                        "Login attempt on locked account {UserId}",
                        "LoginFailed_Locked",
                        properties: new Dictionary<string, object?>
                        {
                            { "UserId", user.Id },
                            { "LockReason", activeLock.Reason }
                        });
                    // M11: không tiết lộ trạng thái khóa cho người gọi (lý do đã được ghi log)
                    return Result<AuthResponseDto>.BadRequest("Email hoặc mật khẩu không đúng.");
                }

                var passwordValid = await _unitOfWork.Users.CheckPasswordAsync(user, request.Password);
                if (!passwordValid)
                {
                    await _unitOfWork.Users.AccessFailedAsync(user);
                    var failCount = await _unitOfWork.Users.GetAccessFailedCountAsync(user);

                    if (failCount >= 5)
                    {
                        var expiresAt = DateTime.Now.AddMinutes(30);
                        await _unitOfWork.AccountLocks.LockUserAsync(
                            user.Id,
                            "Too many failed login attempts",
                            ELockType.Temporary,
                            expiresAt);

                        user.AddDomainEvent(new Domain.Events.UserLockedEvent(
                            user.Id,
                            user.Email,
                            "Too many failed login attempts",
                            expiresAt));

                        await _unitOfWork.CompleteAsync(cancellationToken);
                        // M11: thông báo chung — không tiết lộ cơ chế khóa cho kẻ tấn công
                        return Result<AuthResponseDto>.BadRequest("Email hoặc mật khẩu không đúng.");
                    }

                    // M11: trước đây lộ "Remaining attempts: {n}" → cho phép xác định tài khoản tồn tại
                    return Result<AuthResponseDto>.BadRequest("Email hoặc mật khẩu không đúng.");
                }

                await _unitOfWork.Users.ResetAccessFailedCountAsync(user);

                var roles = await _unitOfWork.Users.GetRolesAsync(user);
                var permissions = await _unitOfWork.Users
                    .GetPermissionsQuery(user)
                    .ToListAsync(cancellationToken);
                var permissionNames = permissions.Select(p => p.Name).ToList();

                var accessToken = _tokenService.GenerateAccessToken(user, roles, permissionNames);
                var rawRefreshToken = _tokenService.GenerateRefreshToken();
                var refreshTokenHash = _tokenService.HashToken(rawRefreshToken);
                var tokenFamilyId = Guid.NewGuid();

                user.RefreshTokens.Add(new Domain.Entities.RefreshToken
                {
                    Token = refreshTokenHash,
                    TokenHash = refreshTokenHash,
                    UserAgentHash = HashUserAgent(request.UserAgent),
                    IpSubnet = ExtractIpSubnet(request.IpAddress),
                    FamilyId = tokenFamilyId,
                    ExpiryDate = DateTime.Now.AddDays(7),
                    IsRevoked = false,
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
                    Email = user.Email ?? string.Empty,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    FullName = user.FullName,
                    PhoneNumber = user.PhoneNumber ?? string.Empty,
                    CustomerLevel = user.CustomerLevel,
                    Roles = [.. roles],
                    AccessToken = accessToken,
                    RefreshToken = rawRefreshToken,
                    Permissions = permissionNames,
                    Avatar = await _fileStorageService.GetFileUrlAsync(user.Avatar),
                    MustChangePassword = user.MustChangePassword
                };

                await _logger.LogAsync(
                    ELogLevel.Information,
                    "User {UserId} logged in successfully",
                    "LoginSuccess",
                    properties: new Dictionary<string, object?>
                    {
                        { "UserId", user.Id }
                    });
                await _userActivityService.LogActivityAsync("Login", "Login successful", string.Empty, response.UserId);

                return Result<AuthResponseDto>.Success(response);
            }
            catch (Exception ex)
            {
                await _logger.LogExceptionAsync(ex, "LoginFailed");
                await _logger.LogAsync(ELogLevel.Warning, "Login failed", "LoginFailed");
                return Result<AuthResponseDto>.BadRequest($"Login failed: {ex.Message}");
            }
        }

        private static string? HashUserAgent(string? userAgent)
        {
            if (string.IsNullOrWhiteSpace(userAgent))
            {
                return null;
            }

            var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(userAgent));
            return Convert.ToHexString(bytes).ToLowerInvariant();
        }

        private static string? ExtractIpSubnet(string? ipAddress)
        {
            if (string.IsNullOrWhiteSpace(ipAddress))
            {
                return null;
            }

            var parts = ipAddress.Split('.', StringSplitOptions.RemoveEmptyEntries);
            if (parts.Length == 4)
            {
                return $"{parts[0]}.{parts[1]}.{parts[2]}";
            }

            return ipAddress;
        }
    }
}

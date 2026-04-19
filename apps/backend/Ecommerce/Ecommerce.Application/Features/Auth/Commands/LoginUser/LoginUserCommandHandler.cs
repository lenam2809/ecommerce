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
                    return Result<AuthResponseDto>.BadRequest("Invalid email or password.");
                }

                if (await _unitOfWork.AccountLocks.IsUserLockedAsync(user.Id))
                {
                    var activeLock = await _unitOfWork.AccountLocks.GetActiveLockAsync(user.Id);
                    return Result<AuthResponseDto>.BadRequest(
                        $"Account is locked. Reason: {activeLock.Reason}. " +
                        (activeLock.ExpiresAt.HasValue
                            ? $"Unlocks at: {activeLock.ExpiresAt.Value:u}"
                            : "Permanent lock."));
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
                        return Result<AuthResponseDto>.BadRequest("Account locked for 30 minutes due to too many failed attempts.");
                    }

                    return Result<AuthResponseDto>.BadRequest($"Invalid email or password. Remaining attempts: {5 - failCount}.");
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

                await _logger.LogAsync(ELogLevel.Information, $"User {user.Email} logged in successfully.", "LoginSuccess");
                await _userActivityService.LogActivityAsync("Login", "Login successful", string.Empty, response.UserId);

                return Result<AuthResponseDto>.Success(response);
            }
            catch (Exception ex)
            {
                await _logger.LogExceptionAsync(ex, "Login failed with exception");
                await _logger.LogAsync(ELogLevel.Warning, $"Login failed for {request.Email}", "LoginFailed");
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

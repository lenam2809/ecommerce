using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Auth.Dto;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Events;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Domain.Interfaces.Logging;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;

namespace Ecommerce.Application.Features.Auth.Commands.ExternalLogin
{
    public sealed class ExternalLoginCommandHandler : IRequestHandler<ExternalLoginCommand, Result<AuthResponseDto>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ITokenService _tokenService;
        private readonly IFileStorageService _fileStorageService;
        private readonly IEnhancedLogger _logger;
        private readonly IUserActivityService _userActivityService;
        private readonly IMergeCartService _mergeCartService;
        private readonly IPublisher _publisher;

        public ExternalLoginCommandHandler(
            IUnitOfWork unitOfWork,
            ITokenService tokenService,
            IFileStorageService fileStorageService,
            IEnhancedLogger logger,
            IUserActivityService userActivityService,
            IMergeCartService mergeCartService,
            IPublisher publisher)
        {
            _unitOfWork = unitOfWork;
            _tokenService = tokenService;
            _fileStorageService = fileStorageService;
            _logger = logger;
            _userActivityService = userActivityService;
            _mergeCartService = mergeCartService;
            _publisher = publisher;
        }

        public async Task<Result<AuthResponseDto>> Handle(ExternalLoginCommand request, CancellationToken cancellationToken)
        {
            try
            {
                if (!string.Equals(request.Provider, "Google", StringComparison.OrdinalIgnoreCase))
                {
                    return Result<AuthResponseDto>.BadRequest("External login provider is not supported.");
                }

                if (string.IsNullOrWhiteSpace(request.ProviderKey) || string.IsNullOrWhiteSpace(request.Email))
                {
                    return Result<AuthResponseDto>.BadRequest("External login payload is invalid.");
                }

                var normalizedEmail = request.Email.Trim().ToLowerInvariant();
                var user = await _unitOfWork.Users.GetByLoginAsync(request.Provider, request.ProviderKey)
                    ?? await _unitOfWork.Users.GetByEmailAsync(normalizedEmail);

                var isNewUser = false;
                if (user == null)
                {
                    isNewUser = true;
                    var names = BuildNames(request.FirstName, request.LastName, normalizedEmail);
                    user = new ApplicationUser
                    {
                        UserName = normalizedEmail,
                        Email = normalizedEmail,
                        EmailConfirmed = true,
                        FirstName = names.FirstName,
                        LastName = names.LastName,
                        FullName = $"{names.FirstName} {names.LastName}",
                        Avatar = request.Picture ?? string.Empty,
                        CustomerLevel = ECustomerLevel.Bronze,
                        PromotionPoints = 0,
                        Status = EUserStatus.Active
                    };

                    var password = GenerateCompliantPassword();
                    var createdUser = await _unitOfWork.Users.AddAsync(user, password);
                    if (createdUser == null)
                    {
                        return Result<AuthResponseDto>.BadRequest("Unable to create external login account.");
                    }

                    await _unitOfWork.Carts.AddAsync(new Ecommerce.Domain.Entities.Cart(user.Id), cancellationToken);
                    await _unitOfWork.Wishlists.AddAsync(new Wishlist
                    {
                        ApplicationUserId = user.Id,
                        WishlistItems = []
                    }, cancellationToken);
                    await _unitOfWork.Users.AddToRoleAsync(user, EUserRoles.Customer);
                }
                else
                {
                    user.EmailConfirmed = true;
                    if (string.IsNullOrWhiteSpace(user.Avatar) && !string.IsNullOrWhiteSpace(request.Picture))
                    {
                        user.Avatar = request.Picture;
                    }
                }

                var loginResult = await _unitOfWork.Users.AddLoginAsync(
                    user,
                    new UserLoginInfo(request.Provider, request.ProviderKey, request.Provider));

                if (!loginResult.Succeeded && !loginResult.Errors.Any(e => e.Code == "LoginAlreadyAssociated"))
                {
                    return Result<AuthResponseDto>.BadRequest(string.Join("; ", loginResult.Errors.Select(e => e.Description)));
                }

                var roles = await _unitOfWork.Users.GetRolesAsync(user);
                var permissions = await _unitOfWork.Users.GetPermissionsQuery(user).ToListAsync(cancellationToken);
                var permissionNames = permissions.Select(p => p.Name).ToList();

                var accessToken = _tokenService.GenerateAccessToken(user, roles, permissionNames);
                var rawRefreshToken = _tokenService.GenerateRefreshToken();
                var refreshTokenHash = _tokenService.HashToken(rawRefreshToken);

                user.RefreshTokens.Add(new Ecommerce.Domain.Entities.RefreshToken
                {
                    Token = refreshTokenHash,
                    TokenHash = refreshTokenHash,
                    UserAgentHash = HashUserAgent(request.UserAgent),
                    IpSubnet = ExtractIpSubnet(request.IpAddress),
                    FamilyId = Guid.NewGuid(),
                    ExpiryDate = DateTime.UtcNow.AddDays(7),
                    IsRevoked = false
                });

                await _unitOfWork.Users.UpdateAsync(user);
                await _unitOfWork.CompleteAsync(cancellationToken);

                if (!string.IsNullOrWhiteSpace(request.GuestId))
                {
                    await _mergeCartService.MergeGuestCartToUserAsync(user.Id, request.GuestId, cancellationToken);
                }

                if (isNewUser)
                {
                    await _publisher.Publish(new UserRegisteredEvent(
                        user.Id,
                        user.Email,
                        user.FirstName,
                        user.LastName,
                        EUserRoles.Customer), cancellationToken);
                }

                await _userActivityService.LogActivityAsync("ExternalLogin", "Google login successful", string.Empty, user.Id);
                await _logger.LogAsync(ELogLevel.Information, "User {UserId} signed in with Google", "ExternalLoginSuccess",
                    properties: new Dictionary<string, object?> { { "UserId", user.Id } });

                return Result<AuthResponseDto>.Success(new AuthResponseDto
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
                    MustChangePassword = false
                });
            }
            catch (Exception ex)
            {
                await _logger.LogExceptionAsync(ex, "ExternalLoginFailed");
                return Result<AuthResponseDto>.BadRequest("Google sign-in failed.");
            }
        }

        private static (string FirstName, string LastName) BuildNames(string? firstName, string? lastName, string email)
        {
            var fallback = email.Split('@')[0];
            var safeFirstName = NormalizeName(firstName, fallback);
            var safeLastName = NormalizeName(lastName, "Customer");
            return (safeFirstName, safeLastName);
        }

        private static string NormalizeName(string? value, string fallback)
        {
            var candidate = string.IsNullOrWhiteSpace(value) ? fallback : value.Trim();
            var lettersOnly = new string(candidate.Where(c => char.IsLetter(c) || c == ' ').ToArray()).Trim();
            if (lettersOnly.Length < 2)
            {
                return fallback.Length >= 2 ? fallback : "User";
            }

            return lettersOnly.Length <= 50 ? lettersOnly : lettersOnly[..50];
        }

        private static string GenerateCompliantPassword()
        {
            return $"Gg!{Convert.ToBase64String(RandomNumberGenerator.GetBytes(18))}a1";
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
            return parts.Length == 4 ? $"{parts[0]}.{parts[1]}.{parts[2]}" : ipAddress;
        }
    }
}

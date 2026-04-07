using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Auth.Dto;
using Ecommerce.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Security.Cryptography;
using System.Text;

namespace Ecommerce.Application.Features.Auth.Commands.RefreshToken
{
    public class RefreshTokenCommandHandler : IRequestHandler<RefreshTokenCommand, Result<AuthResponseDto>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ITokenService _tokenService;
        private readonly ILogger<RefreshTokenCommandHandler> _logger;

        public RefreshTokenCommandHandler(
            IUnitOfWork unitOfWork,
            ITokenService tokenService,
            ILogger<RefreshTokenCommandHandler> logger)
        {
            _unitOfWork = unitOfWork;
            _tokenService = tokenService;
            _logger = logger;
        }

        public async Task<Result<AuthResponseDto>> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrEmpty(request.AccessToken) || string.IsNullOrEmpty(request.RefreshToken))
            {
                return Result<AuthResponseDto>.BadRequest("Access token and refresh token are required.");
            }

            if (!_tokenService.ValidateToken(request.AccessToken))
            {
                return Result<AuthResponseDto>.BadRequest("Invalid access token.");
            }

            var userId = _tokenService.GetUserIdFromToken(request.AccessToken);
            if (string.IsNullOrEmpty(userId))
            {
                return Result<AuthResponseDto>.BadRequest("Invalid access token.");
            }

            var user = await _unitOfWork.Users.GetByIdAsync(Guid.Parse(userId));
            if (user == null)
            {
                return Result<AuthResponseDto>.NotFound("User not found.");
            }

            var incomingHash = _tokenService.HashToken(request.RefreshToken);
            var matchedToken = user.RefreshTokens.FirstOrDefault(
                rt => rt.TokenHash == incomingHash || rt.Token == incomingHash);

            if (matchedToken == null)
            {
                return Result<AuthResponseDto>.BadRequest("Invalid refresh token.");
            }

            if (matchedToken.IsRevoked)
            {
                await RevokeAllUserSessionsAsync(user, cancellationToken);
                return Result<AuthResponseDto>.Unauthorized("Refresh token replay detected. All sessions revoked.");
            }

            if (matchedToken.ExpiryDate < DateTime.UtcNow)
            {
                matchedToken.IsRevoked = true;
                await _unitOfWork.Users.UpdateAsync(user);
                await _unitOfWork.CompleteAsync(cancellationToken);
                return Result<AuthResponseDto>.BadRequest("Refresh token expired.");
            }

            var currentUserAgentHash = HashUserAgent(request.UserAgent);
            if (!string.IsNullOrWhiteSpace(matchedToken.UserAgentHash) &&
                !string.Equals(matchedToken.UserAgentHash, currentUserAgentHash, StringComparison.Ordinal))
            {
                await RevokeAllUserSessionsAsync(user, cancellationToken);
                return Result<AuthResponseDto>.Unauthorized("Refresh token device mismatch.");
            }

            var currentIpSubnet = ExtractIpSubnet(request.IpAddress);
            if (!string.IsNullOrWhiteSpace(matchedToken.IpSubnet) &&
                !string.IsNullOrWhiteSpace(currentIpSubnet) &&
                !string.Equals(matchedToken.IpSubnet, currentIpSubnet, StringComparison.Ordinal))
            {
                _logger.LogWarning(
                    "Refresh token subnet changed for user {UserId}. Previous: {PreviousSubnet}, Current: {CurrentSubnet}",
                    user.Id,
                    matchedToken.IpSubnet,
                    currentIpSubnet);
            }

            var roles = await _unitOfWork.Users.GetRolesAsync(user);
            var permissions = await _unitOfWork.Users.GetPermissionsQuery(user).ToListAsync(cancellationToken: cancellationToken);
            var permissionNames = permissions.Select(p => p.Name).ToList();

            var newAccessToken = _tokenService.GenerateAccessToken(user, roles, permissionNames);
            var newRawRefreshToken = _tokenService.GenerateRefreshToken();
            var newRefreshTokenHash = _tokenService.HashToken(newRawRefreshToken);

            matchedToken.IsRevoked = true;

            user.RefreshTokens.Add(new Domain.Entities.RefreshToken
            {
                Token = newRefreshTokenHash,
                TokenHash = newRefreshTokenHash,
                UserAgentHash = matchedToken.UserAgentHash ?? currentUserAgentHash,
                IpSubnet = currentIpSubnet ?? matchedToken.IpSubnet,
                FamilyId = matchedToken.FamilyId == Guid.Empty ? Guid.NewGuid() : matchedToken.FamilyId,
                ParentTokenId = matchedToken.Id,
                ApplicationUserId = user.Id,
                ExpiryDate = DateTime.UtcNow.AddDays(7),
                IsRevoked = false,
            });

            await _unitOfWork.Users.UpdateAsync(user);
            await _unitOfWork.CompleteAsync(cancellationToken);

            return Result<AuthResponseDto>.Success(new AuthResponseDto
            {
                AccessToken = newAccessToken,
                RefreshToken = newRawRefreshToken,
                UserId = user.Id,
                Email = user.Email ?? string.Empty,
                FirstName = user.FirstName ?? string.Empty,
                LastName = user.LastName ?? string.Empty,
                FullName = user.FullName ?? string.Empty,
                PhoneNumber = user.PhoneNumber ?? string.Empty,
                Roles = [..roles],
                Permissions = permissionNames,
            });
        }

        private async Task RevokeAllUserSessionsAsync(Domain.Entities.ApplicationUser user, CancellationToken cancellationToken)
        {
            foreach (var token in user.RefreshTokens.Where(rt => !rt.IsRevoked))
            {
                token.IsRevoked = true;
            }

            await _unitOfWork.Users.UpdateAsync(user);
            await _unitOfWork.CompleteAsync(cancellationToken);
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

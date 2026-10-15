using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Auth.Dto;
using Ecommerce.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Security.Claims;
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
            if (string.IsNullOrWhiteSpace(request.RefreshToken))
            {
                return Result<AuthResponseDto>.BadRequest("Refresh token is required.");
            }

            var incomingHash = _tokenService.HashToken(request.RefreshToken);

            var matchedToken = await _unitOfWork.BaseRepository<Domain.Entities.RefreshToken>()
                .FirstOrDefaultAsync(rt => rt.TokenHash == incomingHash || rt.Token == incomingHash, cancellationToken);

            if (matchedToken == null)
            {
                return Result<AuthResponseDto>.BadRequest("Invalid refresh token.");
            }

            if (!string.IsNullOrWhiteSpace(request.AccessToken))
            {
                var principal = _tokenService.GetPrincipalFromToken(request.AccessToken, validateLifetime: false);
                if (principal == null)
                {
                    return Result<AuthResponseDto>.BadRequest("Invalid access token.");
                }

                var userIdClaim = principal.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var parsedTokenUserId) || parsedTokenUserId != matchedToken.ApplicationUserId)
                {
                    return Result<AuthResponseDto>.BadRequest("Access token does not match refresh token.");
                }
            }

            var user = await _unitOfWork.Users.GetByIdAsync(matchedToken.ApplicationUserId);
            if (user == null)
            {
                return Result<AuthResponseDto>.NotFound("User not found.");
            }

            var userToken = user.RefreshTokens.FirstOrDefault(rt => rt.Id == matchedToken.Id) ?? matchedToken;

            if (userToken.IsRevoked)
            {
                await RevokeAllUserSessionsAsync(user, cancellationToken);
                return Result<AuthResponseDto>.Unauthorized("Refresh token replay detected. All sessions revoked.");
            }

            if (userToken.ExpiryDate < DateTime.UtcNow)
            {
                userToken.IsRevoked = true;
                _unitOfWork.BaseRepository<Domain.Entities.RefreshToken>().Update(userToken);
                await _unitOfWork.CompleteAsync(cancellationToken);
                return Result<AuthResponseDto>.BadRequest("Refresh token expired.");
            }

            var currentUserAgentHash = HashUserAgent(request.UserAgent);
            if (!string.IsNullOrWhiteSpace(userToken.UserAgentHash) &&
                !string.Equals(userToken.UserAgentHash, currentUserAgentHash, StringComparison.Ordinal))
            {
                await RevokeAllUserSessionsAsync(user, cancellationToken);
                return Result<AuthResponseDto>.Unauthorized("Refresh token device mismatch.");
            }

            var currentIpSubnet = ExtractIpSubnet(request.IpAddress);
            if (!string.IsNullOrWhiteSpace(userToken.IpSubnet) &&
                !string.IsNullOrWhiteSpace(currentIpSubnet) &&
                !string.Equals(userToken.IpSubnet, currentIpSubnet, StringComparison.Ordinal))
            {
                _logger.LogWarning(
                    "Refresh token subnet changed for user {UserId}. Previous: {PreviousSubnet}, Current: {CurrentSubnet}",
                    user.Id,
                    userToken.IpSubnet,
                    currentIpSubnet);
            }

            var roles = await _unitOfWork.Users.GetRolesAsync(user);
            var permissions = await _unitOfWork.Users.GetPermissionsQuery(user).ToListAsync(cancellationToken: cancellationToken);
            var permissionNames = permissions.Select(p => p.Name).ToList();

            var newAccessToken = _tokenService.GenerateAccessToken(user, roles, permissionNames);
            var newRawRefreshToken = _tokenService.GenerateRefreshToken();
            var newRefreshTokenHash = _tokenService.HashToken(newRawRefreshToken);

            userToken.IsRevoked = true;
            _unitOfWork.BaseRepository<Domain.Entities.RefreshToken>().Update(userToken);

            user.RefreshTokens.Add(new Domain.Entities.RefreshToken
            {
                Token = newRefreshTokenHash,
                TokenHash = newRefreshTokenHash,
                UserAgentHash = userToken.UserAgentHash ?? currentUserAgentHash,
                IpSubnet = currentIpSubnet ?? userToken.IpSubnet,
                FamilyId = userToken.FamilyId == Guid.Empty ? Guid.NewGuid() : userToken.FamilyId,
                ParentTokenId = userToken.Id,
                ApplicationUserId = user.Id,
                ExpiryDate = DateTime.UtcNow.AddDays(7),
                IsRevoked = false,
            });

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
            var refreshTokensRepo = _unitOfWork.BaseRepository<Domain.Entities.RefreshToken>();
            var userTokens = await refreshTokensRepo
                .GetQueryable(tracking: true)
                .Where(rt => rt.ApplicationUserId == user.Id && !rt.IsRevoked)
                .ToListAsync(cancellationToken);

            foreach (var token in userTokens)
            {
                token.IsRevoked = true;
                refreshTokensRepo.Update(token);
            }

            if (user.RefreshTokens != null)
            {
                foreach (var token in user.RefreshTokens.Where(rt => !rt.IsRevoked))
                {
                    token.IsRevoked = true;
                    refreshTokensRepo.Update(token);
                }
            }

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

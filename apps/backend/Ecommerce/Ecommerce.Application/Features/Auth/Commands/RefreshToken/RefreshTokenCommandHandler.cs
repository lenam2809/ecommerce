using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Auth.Dto;
using Ecommerce.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Application.Features.Auth.Commands.RefreshToken
{
    public class RefreshTokenCommandHandler : IRequestHandler<RefreshTokenCommand, Result<AuthResponseDto>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ITokenService _tokenService;

        public RefreshTokenCommandHandler(IUnitOfWork unitOfWork, ITokenService tokenService)
        {
            _unitOfWork = unitOfWork;
            _tokenService = tokenService;
        }

        public async Task<Result<AuthResponseDto>> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
        {
            // Validate the expired access token
            if (!_tokenService.ValidateToken(request.AccessToken))
            {
                return Result<AuthResponseDto>.BadRequest("Access token không hợp lệ.");
            }

            // Get user ID from the expired token
            var userId = _tokenService.GetUserIdFromToken(request.AccessToken);
            if (string.IsNullOrEmpty(userId))
            {
                return Result<AuthResponseDto>.BadRequest("Access token không hợp lệ.");
            }

            // Get the user
            var user = await _unitOfWork.Users.GetByIdAsync(Guid.Parse(userId));
            if (user == null)
            {
                return Result<AuthResponseDto>.NotFound("Không tìm thấy người dùng.");
            }

            // Find the refresh token
            var storedToken = user.RefreshTokens.FirstOrDefault(rt => rt.Token == request.RefreshToken && !rt.IsRevoked);
            if (storedToken == null)
            {
                return Result<AuthResponseDto>.BadRequest("Refresh token không hợp lệ.");
            }

            // Check if the refresh token is expired
            if (storedToken.ExpiryDate < DateTime.Now)
            {
                storedToken.IsRevoked = true;
                await _unitOfWork.Users.UpdateAsync(user);
                await _unitOfWork.CompleteAsync();
                return Result<AuthResponseDto>.BadRequest("Refresh token đã hết hạn.");
            }

            // Generate new tokens
            var roles = await _unitOfWork.Users.GetRolesAsync(user);
            var permissions = await _unitOfWork.Users.GetPermissionsQuery(user).ToListAsync();
            var permissionNames = permissions.Select(p => p.Name).ToList();

            var newAccessToken = _tokenService.GenerateAccessToken(user, roles, permissionNames);
            var newRefreshToken = _tokenService.GenerateRefreshToken();

            // Revoke old refresh token
            storedToken.IsRevoked = true;

            // Add new refresh token
            var refreshTokenEntity = new Domain.Entities.RefreshToken
            {
                Token = newRefreshToken,
                ApplicationUserId = user.Id,
                ExpiryDate = DateTime.Now.AddDays(7),
                IsRevoked = false
            };

            user.RefreshTokens.Add(refreshTokenEntity);
            await _unitOfWork.Users.UpdateAsync(user);
            await _unitOfWork.CompleteAsync(cancellationToken);

            return Result<AuthResponseDto>.Success(new AuthResponseDto
            {
                AccessToken = newAccessToken,
                RefreshToken = newRefreshToken,
                UserId = user.Id,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                FullName = user.FullName,
                PhoneNumber = user.PhoneNumber,
                Roles = [.. roles],
                Permissions = permissionNames
            });
        }
    }
}


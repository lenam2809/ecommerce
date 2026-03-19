using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Authorization;

namespace Ecommerce.Application.Features.Auth.Commands.RevokeToken
{
    [Authorize]
    public class RevokeTokenCommandHandler : IRequestHandler<RevokeTokenCommand, Result<bool>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICurrentUserService _currentUserService;

        public RevokeTokenCommandHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUserService)
        {
            _unitOfWork = unitOfWork;
            _currentUserService = currentUserService;
        }

        public async Task<Result<bool>> Handle(RevokeTokenCommand request, CancellationToken cancellationToken)
        {
            if (_currentUserService.UserId == null)
            {
                throw new UnauthorizedAccessException("Người dùng chưa được xác thực.");
            }

            var user = await _unitOfWork.Users.GetByIdAsync(_currentUserService.UserId.Value);
            if (user == null)
            {
                return Result<bool>.NotFound("Không tìm thấy người dùng.");
            }

            var refreshToken = user.RefreshTokens.FirstOrDefault(rt => rt.Token == request.RefreshToken && !rt.IsRevoked);
            if (refreshToken == null)
            {
                return Result<bool>.BadRequest("Refresh token không hợp lệ.");
            }

            // Revoke the token
            refreshToken.IsRevoked = true;
            await _unitOfWork.Users.UpdateAsync(user);
            await _unitOfWork.CompleteAsync();

            return Result<bool>.Success(true);
        }
    }
}


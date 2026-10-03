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
        private readonly ITokenService _tokenService;

        public RevokeTokenCommandHandler(
            IUnitOfWork unitOfWork,
            ICurrentUserService currentUserService,
            ITokenService tokenService)
        {
            _unitOfWork = unitOfWork;
            _currentUserService = currentUserService;
            _tokenService = tokenService;
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

            // 🔒 SECURITY (H2): DB chỉ lưu HMAC-SHA256 hash của refresh token
            // (LoginUserCommandHandler lưu TokenHash = HMAC). So sánh raw token với cột hash
            // không bao giờ khớp → revoke trở thành no-op. Phải hash token client gửi lên rồi
            // so với TokenHash (đúng cách như RefreshTokenCommandHandler.cs:54-55 đang làm).
            var incomingHash = _tokenService.HashToken(request.RefreshToken);
            var refreshToken = user.RefreshTokens.FirstOrDefault(rt => rt.TokenHash == incomingHash && !rt.IsRevoked);
            if (refreshToken == null)
            {
                return Result<bool>.BadRequest("Refresh token không hợp lệ.");
            }

            // Revoke the token — sau bước này token không thể dùng refresh được nữa
            // (RefreshTokenCommandHandler.cs:62-66 phát hiện IsRevoked → revoke toàn bộ session)
            refreshToken.IsRevoked = true;
            await _unitOfWork.Users.UpdateAsync(user);
            await _unitOfWork.CompleteAsync(cancellationToken);

            return Result<bool>.Success(true);
        }
    }
}


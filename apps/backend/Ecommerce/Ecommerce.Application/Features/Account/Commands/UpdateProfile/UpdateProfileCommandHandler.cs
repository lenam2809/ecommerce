using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Domain.Interfaces.Logging;
using MediatR;

namespace Ecommerce.Application.Features.Account.Commands.UpdateProfile
{
    /// <summary>
    /// Handler xử lý lệnh cập nhật thông tin cá nhân người dùng
    /// </summary>
    public class UpdateProfileCommandHandler : IRequestHandler<UpdateProfileCommand, Result<bool>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICurrentUserService _currentUserService;
        private readonly IEnhancedLogger _logger;

        /// <summary>
        /// Constructor với Dependency Injection
        /// </summary>
        public UpdateProfileCommandHandler(
            IUnitOfWork unitOfWork,
            ICurrentUserService currentUserService,
            IEnhancedLogger logger)
        {
            _unitOfWork = unitOfWork;
            _currentUserService = currentUserService;
            _logger = logger;
        }

        /// <summary>
        /// Xử lý yêu cầu cập nhật thông tin cá nhân
        /// </summary>
        public async Task<Result<bool>> Handle(UpdateProfileCommand request, CancellationToken cancellationToken)
        {
            // Lấy ID của người dùng hiện tại từ token
            var userId = _currentUserService.UserId;
            if (userId == Guid.Empty || userId == null)
            {
                return Result<bool>.Unauthorized("Người dùng chưa đăng nhập.");
            }

            // Tìm kiếm người dùng theo ID
            var user = await _unitOfWork.Users.GetByIdAsync(userId.Value);
            if (user == null)
            {
                return Result<bool>.NotFound("Không tìm thấy người dùng.");
            }

            // Cập nhật thông tin cá nhân
            user.FirstName = request.FirstName;
            user.LastName = request.LastName;
            user.PhoneNumber = request.PhoneNumber;
            user.UpdatedAt = DateTime.Now;

            if (!string.IsNullOrEmpty(request.AvatarUrl))
            {
                user.Avatar = request.AvatarUrl;
            }

            // Cập nhật thông tin người dùng
            await _unitOfWork.Users.UpdateAsync(user);
            await _unitOfWork.CompleteAsync(cancellationToken);
            await _logger.LogAsync(ELogLevel.Information,
                $"Người dùng {user.Email} đã cập nhật thông tin cá nhân thành công.",
                "Cập nhật thông tin cá nhân");

            return Result<bool>.Success(true);
        }
    }
}


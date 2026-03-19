using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces;
using MediatR;

namespace Ecommerce.Application.Features.Users.Commands.ChangePassword
{
    /// <summary>
    /// Handler xử lý lệnh thay đổi mật khẩu
    /// </summary>
    public class ChangePasswordCommandHandler : IRequestHandler<ChangePasswordCommand, Result<bool>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICurrentUserService _currentUserService;

        /// <summary>
        /// Constructor với Dependency Injection
        /// </summary>
        public ChangePasswordCommandHandler(
            IUnitOfWork unitOfWork,
            ICurrentUserService currentUserService)
        {
            _unitOfWork = unitOfWork;
            _currentUserService = currentUserService;
        }

        /// <summary>
        /// Xử lý yêu cầu thay đổi mật khẩu
        /// </summary>
        public async Task<Result<bool>> Handle(ChangePasswordCommand request, CancellationToken cancellationToken)
        {
            // Kiểm tra quyền: chỉ người dùng hiện tại có thể thay đổi mật khẩu của chính mình
            // hoặc người dùng có quyền admin
            var currentUserId = _currentUserService.UserId;
            var isAdmin = await _currentUserService.IsInRoleAsync(EUserRoles.Admin);

            if (currentUserId != request.UserId && !isAdmin)
            {
                return Result<bool>.Forbidden("Bạn không có quyền thay đổi mật khẩu cho người dùng này.");
            }

            // Lấy thông tin người dùng từ cơ sở dữ liệu
            var user = await _unitOfWork.Users.GetByIdAsync(request.UserId);

            // Kiểm tra nếu không tìm thấy người dùng
            if (user == null)
            {
                return Result<bool>.NotFound($"Không tìm thấy người dùng với ID: {request.UserId}");
            }

            // Xác thực mật khẩu hiện tại
            var isPasswordValid = await _unitOfWork.Users.CheckPasswordAsync(user, request.CurrentPassword);
            if (!isPasswordValid)
            {
                return Result<bool>.BadRequest("Mật khẩu hiện tại không chính xác.");
            }

            // Cập nhật mật khẩu mới
            var result = await _unitOfWork.Users.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword);

            if (!result.Succeeded)
            {
                return Result<bool>.BadRequest("Không thể thay đổi mật khẩu.");
            }

            // Cập nhật thời gian chỉnh sửa
            user.UpdatedAt = DateTime.Now;
            await _unitOfWork.Users.UpdateAsync(user);

            // Lưu các thay đổi vào cơ sở dữ liệu
            await _unitOfWork.CompleteAsync();

            // Trả về kết quả thành công
            return Result<bool>.Success(true);
        }
    }
}


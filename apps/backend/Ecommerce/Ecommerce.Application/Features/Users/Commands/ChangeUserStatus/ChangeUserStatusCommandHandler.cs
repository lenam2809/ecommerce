using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces;
using MediatR;

namespace Ecommerce.Application.Features.Users.Commands.ChangeUserStatus
{
    /// <summary>
    /// Handler xử lý lệnh thay đổi trạng thái người dùng
    /// </summary>
    public class ChangeUserStatusCommandHandler : IRequestHandler<ChangeUserStatusCommand, Result<bool>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICurrentUserService _currentUserService;

        /// <summary>
        /// Constructor với Dependency Injection
        /// </summary>
        public ChangeUserStatusCommandHandler(
            IUnitOfWork unitOfWork,
            ICurrentUserService currentUserService)
        {
            _unitOfWork = unitOfWork;
            _currentUserService = currentUserService;
        }

        /// <summary>
        /// Xử lý yêu cầu thay đổi trạng thái người dùng
        /// </summary>
        public async Task<Result<bool>> Handle(ChangeUserStatusCommand request, CancellationToken cancellationToken)
        {
            // Kiểm tra quyền: chỉ admin hoặc staff có thể thay đổi trạng thái người dùng
            var hasPermission = await _currentUserService.IsInRoleAsync(EUserRoles.Admin) ||
                               await _currentUserService.IsInRoleAsync(EUserRoles.Staff);

            if (!hasPermission)
            {
                return Result<bool>.Forbidden("Bạn không có quyền thay đổi trạng thái người dùng.");
            }

            // Kiểm tra nếu người dùng đang cố gắng thay đổi trạng thái của chính mình
            var currentUserId = _currentUserService.UserId;
            if (currentUserId == request.UserId)
            {
                return Result<bool>.BadRequest("Không thể thay đổi trạng thái của tài khoản đang đăng nhập hiện tại.");
            }

            // Lấy thông tin người dùng từ cơ sở dữ liệu
            var user = await _unitOfWork.Users.GetByIdAsync(request.UserId);

            // Kiểm tra nếu không tìm thấy người dùng
            if (user == null)
            {
                return Result<bool>.NotFound($"Không tìm thấy người dùng với ID: {request.UserId}");
            }

            // Kiểm tra nếu người dùng cần thay đổi là admin và người thực hiện không phải admin
            var isUserAdmin = await _unitOfWork.Users.IsInRoleAsync(user, EUserRoles.Admin);
            var currentUserIsAdmin = await _currentUserService.IsInRoleAsync(EUserRoles.Admin);

            if (isUserAdmin && !currentUserIsAdmin)
            {
                return Result<bool>.Forbidden("Chỉ admin mới có quyền thay đổi trạng thái của người dùng admin khác.");
            }

            // Cập nhật trạng thái người dùng
            user.Status = request.NewStatus;
            user.UpdatedAt = DateTime.Now;

            // Lưu ghi chú về lý do thay đổi trạng thái vào cơ sở dữ liệu (nếu có tích hợp audit log)
            // await _auditLogService.LogUserStatusChange(request.UserId, user.Status, request.NewStatus, request.StatusChangeReason);

            // Cập nhật thông tin người dùng vào cơ sở dữ liệu
            await _unitOfWork.Users.UpdateAsync(user);

            // Lưu các thay đổi vào cơ sở dữ liệu
            await _unitOfWork.CompleteAsync();

            // Trả về kết quả thành công
            return Result<bool>.Success(true);
        }
    }
}


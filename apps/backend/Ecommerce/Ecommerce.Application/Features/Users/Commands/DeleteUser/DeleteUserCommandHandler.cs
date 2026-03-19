using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Interfaces;
using MediatR;

namespace Ecommerce.Application.Features.Users.Commands.DeleteUser
{
    /// <summary>
    /// Handler xử lý lệnh xóa người dùng
    /// </summary>
    public class DeleteUserCommandHandler : IRequestHandler<DeleteUserCommand, Result<bool>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IFileStorageService _fileService;
        private readonly ICurrentUserService _currentUserService;

        /// <summary>
        /// Constructor với Dependency Injection
        /// </summary>
        public DeleteUserCommandHandler(
            IUnitOfWork unitOfWork,
            IFileStorageService fileService,
            ICurrentUserService currentUserService)
        {
            _unitOfWork = unitOfWork;
            _fileService = fileService;
            _currentUserService = currentUserService;
        }

        /// <summary>
        /// Xử lý yêu cầu xóa người dùng
        /// </summary>
        public async Task<Result<bool>> Handle(DeleteUserCommand request, CancellationToken cancellationToken)
        {
            // Kiểm tra nếu người dùng đang cố gắng xóa chính mình
            if (_currentUserService.UserId == request.Id)
            {
                return Result<bool>.BadRequest("Không thể xóa tài khoản đang đăng nhập hiện tại.");
            }

            // Lấy thông tin người dùng từ cơ sở dữ liệu
            var user = await _unitOfWork.Users.GetByIdAsync(request.Id);

            // Kiểm tra nếu không tìm thấy người dùng
            if (user == null)
            {
                return Result<bool>.NotFound($"Không tìm thấy người dùng với ID: {request.Id}");
            }

            // Xóa ảnh đại diện của người dùng nếu có
            if (!string.IsNullOrEmpty(user.Avatar))
            {
                await _fileService.DeleteFileAsync(user.Avatar);
            }

            // Xóa người dùng khỏi cơ sở dữ liệu
            await _unitOfWork.Users.DeleteAsync(user);

            // Lưu các thay đổi vào cơ sở dữ liệu
            await _unitOfWork.CompleteAsync(cancellationToken);

            // Trả về kết quả thành công
            return Result<bool>.Success(true);
        }
    }
}

using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Interfaces;
using MediatR;

namespace Ecommerce.Application.Features.Users.Commands.UpdateUser
{
    /// <summary>
    /// Handler xử lý lệnh cập nhật thông tin người dùng
    /// </summary>
    public class UpdateUserCommandHandler : IRequestHandler<UpdateUserCommand, Result<bool>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IFileStorageService _fileService;

        /// <summary>
        /// Constructor với Dependency Injection
        /// </summary>
        public UpdateUserCommandHandler(IUnitOfWork unitOfWork, IFileStorageService fileService)
        {
            _unitOfWork = unitOfWork;
            _fileService = fileService;
        }

        /// <summary>
        /// Xử lý yêu cầu cập nhật thông tin người dùng
        /// </summary>
        public async Task<Result<bool>> Handle(UpdateUserCommand request, CancellationToken cancellationToken)
        {
            // Lấy thông tin người dùng từ cơ sở dữ liệu
            var user = await _unitOfWork.Users.GetByIdAsync(request.Id);

            // Kiểm tra nếu không tìm thấy người dùng
            if (user == null)
            {
                return Result<bool>.NotFound($"Không tìm thấy người dùng với ID: {request.Id}");
            }

            // Cập nhật thông tin người dùng
            user.FirstName = request.FirstName;
            user.LastName = request.LastName;
            user.PhoneNumber = request.PhoneNumber;
            user.CustomerLevel = request.CustomerLevel;
            user.PromotionPoints = request.PromotionPoints;
            user.Status = request.Status;
            user.UpdatedAt = DateTime.Now;

            // Xử lý tải lên ảnh đại diện mới nếu có
            if (request.Avatar != null)
            {
                try
                {
                    // Xóa ảnh đại diện cũ nếu có
                    if (!string.IsNullOrEmpty(user.Avatar))
                    {
                        await _fileService.DeleteFileAsync(user.Avatar);
                    }

                    // Tải lên ảnh đại diện mới và lưu đường dẫn vào Avatar
                    string avatarUrl = await _fileService.SaveFileAsync(request.Avatar, "users");
                    user.Avatar = avatarUrl;
                }
                catch (Exception ex)
                {
                    return Result<bool>.BadRequest($"Không thể tải lên ảnh đại diện: {ex.Message}");
                }
            }

            // Cập nhật thông tin người dùng vào cơ sở dữ liệu
            await _unitOfWork.Users.UpdateAsync(user);

            // Lưu các thay đổi vào cơ sở dữ liệu
            await _unitOfWork.CompleteAsync(cancellationToken);

            // Trả về kết quả thành công
            return Result<bool>.Success(true);
        }
    }
}

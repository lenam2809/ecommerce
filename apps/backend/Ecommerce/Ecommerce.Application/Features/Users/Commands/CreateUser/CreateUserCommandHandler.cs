using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces;
using MediatR;

namespace Ecommerce.Application.Features.Users.Commands.CreateUser
{
    /// <summary>
    /// Handler xử lý lệnh tạo người dùng mới
    /// </summary>
    public class CreateUserCommandHandler : IRequestHandler<CreateUserCommand, Result<Guid>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IPermissionRepository _permissionRepository;
        private readonly IFileStorageService _fileService;

        /// <summary>
        /// Constructor với Dependency Injection
        /// </summary>
        public CreateUserCommandHandler(
            IUnitOfWork unitOfWork,
            IPermissionRepository permissionRepository,
            IFileStorageService fileService)
        {
            _unitOfWork = unitOfWork;
            _permissionRepository = permissionRepository;
            _fileService = fileService;
        }

        /// <summary>
        /// Xử lý yêu cầu tạo người dùng mới
        /// </summary>
        public async Task<Result<Guid>> Handle(CreateUserCommand request, CancellationToken cancellationToken)
        {
            // Tạo đối tượng người dùng mới từ thông tin request
            var user = new ApplicationUser
            {
                UserName = request.Email,
                Email = request.Email,
                FirstName = request.FirstName,
                LastName = request.LastName,
                PhoneNumber = request.PhoneNumber,
                CustomerLevel = request.CustomerLevel,
                PromotionPoints = request.PromotionPoints,
                Status = request.Status,
                CreatedAt = DateTime.Now
            };

            // Xử lý tải lên ảnh đại diện nếu có
            if (request.Avatar != null)
            {
                try
                {
                    // Tải lên ảnh đại diện và lưu đường dẫn vào Avatar
                    string avatarUrl = await _fileService.SaveFileAsync(request.Avatar,
                        "users");
                    user.Avatar = avatarUrl;
                }
                catch (Exception ex)
                {
                    return Result<Guid>.BadRequest($"Không thể tải lên ảnh đại diện: {ex.Message}");
                }
            }

            // Thêm người dùng mới vào hệ thống
            var result = await _unitOfWork.Users.AddAsync(user, request.Password);
            if (result == null)
            {
                return Result<Guid>.BadRequest("Không thể tạo người dùng mới.");
            }

            // Gán vai trò cho người dùng
            await _unitOfWork.Users.AddToRoleAsync(user, request.Role);

            // Gán quyền dựa trên vai trò
            await AssignPermissionsByRole(user, request.Role);

            // Lưu các thay đổi vào cơ sở dữ liệu
            await _unitOfWork.CompleteAsync(cancellationToken);

            // Trả về kết quả thành công với ID của người dùng mới
            return Result<Guid>.Success(user.Id);
        }

        /// <summary>
        /// Gán quyền cho người dùng dựa trên vai trò
        /// </summary>
        private async Task AssignPermissionsByRole(ApplicationUser user, string role)
        {
            if (role == EUserRoles.Admin)
            {
                // Admin có tất cả các quyền
                var allPermissions = await _permissionRepository.GetAllAsync();
                foreach (var permission in allPermissions)
                {
                    await _unitOfWork.Users.AddPermissionAsync(user, permission);
                }
            }
            else if (role == EUserRoles.Staff)
            {
                // Quyền của nhân viên
                var staffPermissions = new[]
                {
                    EPermissions.ViewProducts,
                    EPermissions.CreateProduct,
                    EPermissions.EditProduct,
                    EPermissions.DeleteProduct,
                    EPermissions.ViewCategories,
                    EPermissions.CreateCategory,
                    EPermissions.EditCategory,
                    EPermissions.DeleteCategory,
                    EPermissions.ViewUsers,
                    EPermissions.EditUser
                };

                foreach (var permissionName in staffPermissions)
                {
                    var permission = await _permissionRepository.GetByNameAsync(permissionName);
                    if (permission != null)
                    {
                        await _unitOfWork.Users.AddPermissionAsync(user, permission);
                    }
                }
            }
            else if (role == EUserRoles.Customer)
            {
                // Quyền của khách hàng
                var customerPermissions = new[]
                {
                    EPermissions.ViewProducts,
                    EPermissions.ViewCategories
                };

                foreach (var permissionName in customerPermissions)
                {
                    var permission = await _permissionRepository.GetByNameAsync(permissionName);
                    if (permission != null)
                    {
                        await _unitOfWork.Users.AddPermissionAsync(user, permission);
                    }
                }
            }
        }
    }
}

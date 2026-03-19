using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Domain.Interfaces.Logging;
using MediatR;

namespace Ecommerce.Application.Features.Permissions.Commands.AssignPermissionToRole
{
    //[Authorize(Policy = "AssignPermission")]
    public class AssignPermissionToRoleCommandHandler : IRequestHandler<AssignPermissionToRoleCommand, Result<bool>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IEnhancedLogger _logger;

        public AssignPermissionToRoleCommandHandler(
            IUnitOfWork unitOfWork,
            IEnhancedLogger logger)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        public async Task<Result<bool>> Handle(AssignPermissionToRoleCommand request, CancellationToken cancellationToken)
        {
            // Kiểm tra vai trò tồn tại
            var role = await _unitOfWork.Roles.GetByIdAsync(request.RoleId);
            if (role == null)
            {
                return Result<bool>.NotFound($"Không tìm thấy vai trò với ID: {request.RoleId}");
            }

            // Lấy danh sách quyền hiện tại của role
            var currentPermissions = await _unitOfWork.Roles.GetPermissionsAsync(role);
            var currentPermissionIds = currentPermissions.Select(p => p.Id).ToList();

            // Xác định quyền cần thêm và quyền cần xóa
            var permissionsToAdd = request.PermissionIds
                .Where(id => !currentPermissionIds.Contains(id))
                .ToList();

            var permissionsToRemove = currentPermissionIds
                .Where(id => !request.PermissionIds.Contains(id))
                .ToList();

            try
            {
                // Thêm quyền mới
                foreach (var permissionId in permissionsToAdd)
                {
                    var permission = await _unitOfWork.Permissions.GetByIdAsync(permissionId);
                    if (permission != null)
                    {
                        await _unitOfWork.Roles.AddPermissionAsync(role, permission);
                        await _logger.LogAsync(ELogLevel.Information, $"Đã gán quyền {permission.Name} cho vai trò {role.Name}", "Gán quyền cho vai trò");
                    }
                }

                // Xóa quyền hiện tại
                foreach (var permissionId in permissionsToRemove)
                {
                    var permission = await _unitOfWork.Permissions.GetByIdAsync(permissionId);
                    if (permission != null)
                    {
                        await _unitOfWork.Roles.RemovePermissionAsync(role, permission);
                        await _logger.LogAsync(ELogLevel.Information, $"Đã thu hồi quyền {permission.Name} cho vai trò {role.Name}", "Thu hồi quyền cho vai trò");
                    }
                }

                await _unitOfWork.CompleteAsync(cancellationToken);

                // Cập nhật claims cho tất cả người dùng thuộc vai trò này
                await _unitOfWork.Users.RefreshUserClaimsInRoleAsync(role.Name);

                return Result<bool>.Success(true);
            }
            catch (Exception ex)
            {
                await _logger.LogExceptionAsync(ex, $"Lỗi khi cập nhật quyền cho vai trò {role.Id}");
                return Result<bool>.BadRequest("Đã xảy ra lỗi khi cập nhật quyền cho vai trò.");
            }
        }
    }
}


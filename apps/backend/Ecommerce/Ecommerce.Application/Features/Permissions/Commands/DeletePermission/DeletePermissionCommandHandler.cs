using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Interfaces;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Ecommerce.Application.Features.Permissions.Commands.DeletePermission
{
    //[Authorize(Policy = "DeletePermission")]
    public class DeletePermissionCommandHandler : IRequestHandler<DeletePermissionCommand, Result<bool>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<DeletePermissionCommandHandler> _logger;

        public DeletePermissionCommandHandler(
            IUnitOfWork unitOfWork,
            ILogger<DeletePermissionCommandHandler> logger)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        public async Task<Result<bool>> Handle(DeletePermissionCommand request, CancellationToken cancellationToken)
        {
            // Tìm permission cần xóa
            var permission = await _unitOfWork.Permissions.GetByIdAsync(request.Id);
            if (permission == null)
            {
                return Result<bool>.NotFound($"Không tìm thấy quyền với ID: {request.Id}");
            }

            // Kiểm tra xem quyền này có phải là quyền mặc định không
            if (IsDefaultPermission(permission.Name))
            {
                return Result<bool>.BadRequest($"Không thể xóa quyền mặc định '{permission.Name}'.");
            }

            // Kiểm tra xem quyền đã được gán cho user hoặc role nào chưa
            var isAssignedToUser = await _unitOfWork.Permissions.IsAssignedToAnyUser(permission.Id);
            var isAssignedToRole = await _unitOfWork.Permissions.IsAssignedToAnyRole(permission.Id);

            if (isAssignedToUser || isAssignedToRole)
            {
                return Result<bool>.BadRequest($"Không thể xóa quyền '{permission.Name}' vì đã được gán cho người dùng hoặc vai trò.");
            }

            // Xóa permission
            _unitOfWork.Permissions.Delete(permission);
            await _unitOfWork.CompleteAsync(cancellationToken);

            _logger.LogInformation("Đã xóa permission: {PermissionId}, {PermissionName}", permission.Id, permission.Name);

            return Result<bool>.Success(true);
        }

        private bool IsDefaultPermission(string permissionName)
        {
            // Kiểm tra xem quyền có nằm trong danh sách quyền mặc định không
            var allDefaultPermissions = Ecommerce.Domain.Enums.EPermissions.Groups.AdminPermissions
                .Concat(Ecommerce.Domain.Enums.EPermissions.Groups.StaffPermissions)
                .Concat(Ecommerce.Domain.Enums.EPermissions.Groups.CustomerPermissions)
                .Distinct();

            return allDefaultPermissions.Contains(permissionName);
        }
    }
}


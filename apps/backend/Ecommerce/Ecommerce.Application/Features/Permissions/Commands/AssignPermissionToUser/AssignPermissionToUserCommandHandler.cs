using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Interfaces;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Ecommerce.Application.Features.Permissions.Commands.AssignPermissionToUser
{
    //[Authorize(Policy = "AssignPermission")]
    public class AssignPermissionToUserCommandHandler : IRequestHandler<AssignPermissionToUserCommand, Result<bool>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<AssignPermissionToUserCommandHandler> _logger;

        public AssignPermissionToUserCommandHandler(
            IUnitOfWork unitOfWork,
            ILogger<AssignPermissionToUserCommandHandler> logger)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        public async Task<Result<bool>> Handle(AssignPermissionToUserCommand request, CancellationToken cancellationToken)
        {
            // Kiểm tra người dùng tồn tại
            var user = await _unitOfWork.Users.GetByIdAsync(request.UserId);
            if (user == null)
            {
                return Result<bool>.NotFound($"Không tìm thấy người dùng với ID: {request.UserId}");
            }

            // Lấy danh sách quyền hiện tại của user
            var currentPermissions = await _unitOfWork.Users.GetPermissionsAsync(user);
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
                        await _unitOfWork.Users.AddPermissionAsync(user, permission);
                        _logger.LogInformation("Đã gán quyền {PermissionName} cho người dùng {UserId}", permission.Name, user.Id);
                    }
                }

                // Xóa quyền hiện tại
                foreach (var permissionId in permissionsToRemove)
                {
                    var permission = await _unitOfWork.Permissions.GetByIdAsync(permissionId);
                    if (permission != null)
                    {
                        await _unitOfWork.Users.RemovePermissionAsync(user, permission);
                        _logger.LogInformation("Đã thu hồi quyền {PermissionName} từ người dùng {UserId}", permission.Name, user.Id);
                    }
                }

                await _unitOfWork.CompleteAsync(cancellationToken);

                return Result<bool>.Success(true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi cập nhật quyền cho người dùng {UserId}", user.Id);
                return Result<bool>.BadRequest("Đã xảy ra lỗi khi cập nhật quyền cho người dùng.");
            }
        }
    }
}


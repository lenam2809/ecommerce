using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Domain.Interfaces.Logging;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Ecommerce.Application.Features.Permissions.Commands.AssignPermissionToUser
{
    //[Authorize(Policy = EPermissions.AssignPermission)]
    public class AssignPermissionToUserCommandHandler : IRequestHandler<AssignPermissionToUserCommand, Result<bool>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<AssignPermissionToUserCommandHandler> _logger;
        private readonly ICacheInvalidationService _cacheInvalidationService;
        private readonly IEnhancedLogger _auditLogger;

        public AssignPermissionToUserCommandHandler(
            IUnitOfWork unitOfWork,
            ILogger<AssignPermissionToUserCommandHandler> logger,
            ICacheInvalidationService cacheInvalidationService,
            IEnhancedLogger auditLogger)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
            _cacheInvalidationService = cacheInvalidationService;
            _auditLogger = auditLogger;
        }

        public async Task<Result<bool>> Handle(AssignPermissionToUserCommand request, CancellationToken cancellationToken)
        {
            var user = await _unitOfWork.Users.GetByIdAsync(request.UserId);
            if (user == null)
            {
                return Result<bool>.NotFound($"Không tìm thấy người dùng với ID: {request.UserId}");
            }

            var currentPermissions = await _unitOfWork.Users.GetPermissionsAsync(user);
            var currentPermissionIds = currentPermissions.Select(p => p.Id).ToList();

            var permissionsToAdd = request.PermissionIds
                .Where(id => !currentPermissionIds.Contains(id))
                .ToList();

            var permissionsToRemove = currentPermissionIds
                .Where(id => !request.PermissionIds.Contains(id))
                .ToList();

            try
            {
                foreach (var permissionId in permissionsToAdd)
                {
                    var permission = await _unitOfWork.Permissions.GetByIdAsync(permissionId);
                    if (permission != null)
                    {
                        await _unitOfWork.Users.AddPermissionAsync(user, permission);
                        _logger.LogInformation("Đã gán quyền {PermissionName} cho người dùng {UserId}", permission.Name, user.Id);
                    }
                }

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
                await _cacheInvalidationService.InvalidateUserCache(user.Id);

                await _auditLogger.LogAsync(
                    ELogLevel.Information,
                    "Updated direct permissions for user {TargetUserId}",
                    "UserPermissionsChanged",
                    ELogType.AccessControl,
                    new Dictionary<string, object?>
                    {
                        { "TargetUserId", user.Id },
                        { "AddedPermissionCount", permissionsToAdd.Count },
                        { "RemovedPermissionCount", permissionsToRemove.Count }
                    });

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

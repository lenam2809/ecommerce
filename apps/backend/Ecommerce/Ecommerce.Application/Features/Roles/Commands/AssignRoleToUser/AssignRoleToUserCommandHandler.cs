using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces.Logging;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;

namespace Ecommerce.Application.Features.Roles.Commands.AssignRoleToUser
{
    //[Authorize(Policy = EPermissions.AssignRole)]
    public class AssignRoleToUserCommandHandler : IRequestHandler<AssignRoleToUserCommand, Result<bool>>
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<Role> _roleManager;
        private readonly ILogger<AssignRoleToUserCommandHandler> _logger;
        private readonly ICacheInvalidationService _cacheInvalidationService;
        private readonly IEnhancedLogger _auditLogger;

        public AssignRoleToUserCommandHandler(
            UserManager<ApplicationUser> userManager,
            RoleManager<Role> roleManager,
            ILogger<AssignRoleToUserCommandHandler> logger,
            ICacheInvalidationService cacheInvalidationService,
            IEnhancedLogger auditLogger)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _logger = logger;
            _cacheInvalidationService = cacheInvalidationService;
            _auditLogger = auditLogger;
        }

        public async Task<Result<bool>> Handle(AssignRoleToUserCommand request, CancellationToken cancellationToken)
        {
            var user = await _userManager.FindByIdAsync(request.UserId.ToString());
            if (user == null)
            {
                return Result<bool>.NotFound($"Không tìm thấy người dùng với ID: {request.UserId}");
            }

            var userRoles = await _userManager.GetRolesAsync(user);

            var removeResult = await _userManager.RemoveFromRolesAsync(user, userRoles);
            if (!removeResult.Succeeded)
            {
                var errors = string.Join(", ", removeResult.Errors.Select(e => e.Description));
                _logger.LogError("Lỗi khi xóa vai trò cũ: {Errors}", errors);
                return Result<bool>.BadRequest($"Không thể xóa vai trò cũ: {errors}");
            }

            var assignedRoleNames = new List<string>();
            if (request.RoleIds.Any())
            {
                foreach (var roleId in request.RoleIds)
                {
                    var role = await _roleManager.FindByIdAsync(roleId.ToString());
                    if (!string.IsNullOrWhiteSpace(role?.Name))
                    {
                        assignedRoleNames.Add(role.Name);
                    }
                }

                if (assignedRoleNames.Any())
                {
                    var addResult = await _userManager.AddToRolesAsync(user, assignedRoleNames);
                    if (!addResult.Succeeded)
                    {
                        var errors = string.Join(", ", addResult.Errors.Select(e => e.Description));
                        _logger.LogError("Lỗi khi thêm vai trò mới: {Errors}", errors);
                        return Result<bool>.BadRequest($"Không thể thêm vai trò mới: {errors}");
                    }
                }
            }

            _logger.LogInformation("Đã gán vai trò cho người dùng: {UserId}", request.UserId);
            await _cacheInvalidationService.InvalidateUserCache(request.UserId);

            await _auditLogger.LogAsync(
                ELogLevel.Information,
                "Assigned roles to user {TargetUserId}",
                "UserRolesChanged",
                ELogType.AccessControl,
                new Dictionary<string, object?>
                {
                    { "TargetUserId", request.UserId },
                    { "RemovedRoles", userRoles },
                    { "AssignedRoles", assignedRoleNames }
                });

            return Result<bool>.Success(true);
        }
    }
}

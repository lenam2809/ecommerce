using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;

namespace Ecommerce.Application.Features.Roles.Commands.AssignRoleToUser
{
    //[Authorize(Policy = "AssignRole")]
    public class AssignRoleToUserCommandHandler : IRequestHandler<AssignRoleToUserCommand, Result<bool>>
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<Role> _roleManager;
        private readonly ILogger<AssignRoleToUserCommandHandler> _logger;

        public AssignRoleToUserCommandHandler(
            UserManager<ApplicationUser> userManager,
            RoleManager<Role> roleManager,
            ILogger<AssignRoleToUserCommandHandler> logger)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _logger = logger;
        }

        public async Task<Result<bool>> Handle(AssignRoleToUserCommand request, CancellationToken cancellationToken)
        {
            // Tìm user dựa trên userId
            var user = await _userManager.FindByIdAsync(request.UserId.ToString());
            if (user == null)
            {
                return Result<bool>.NotFound($"Không tìm thấy người dùng với ID: {request.UserId}");
            }

            // Lấy danh sách vai trò hiện tại của user
            var userRoles = await _userManager.GetRolesAsync(user);

            // Xóa tất cả các vai trò hiện tại của user
            var removeResult = await _userManager.RemoveFromRolesAsync(user, userRoles);
            if (!removeResult.Succeeded)
            {
                var errors = string.Join(", ", removeResult.Errors.Select(e => e.Description));
                _logger.LogError("Lỗi khi xóa vai trò cũ: {Errors}", errors);
                return Result<bool>.BadRequest($"Không thể xóa vai trò cũ: {errors}");
            }

            // Thêm các vai trò mới
            if (request.RoleIds.Any())
            {
                var roleNames = new List<string>();

                foreach (var roleId in request.RoleIds)
                {
                    var role = await _roleManager.FindByIdAsync(roleId.ToString());
                    if (role != null)
                    {
                        roleNames.Add(role.Name);
                    }
                }

                if (roleNames.Any())
                {
                    var addResult = await _userManager.AddToRolesAsync(user, roleNames);
                    if (!addResult.Succeeded)
                    {
                        var errors = string.Join(", ", addResult.Errors.Select(e => e.Description));
                        _logger.LogError("Lỗi khi thêm vai trò mới: {Errors}", errors);
                        return Result<bool>.BadRequest($"Không thể thêm vai trò mới: {errors}");
                    }
                }
            }

            _logger.LogInformation("Đã gán vai trò cho người dùng: {UserId}", request.UserId);

            return Result<bool>.Success(true);
        }
    }
}


using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;

namespace Ecommerce.Application.Features.Roles.Commands.DeleteRole
{
    public class DeleteRoleCommandHandler : IRequestHandler<DeleteRoleCommand, Result<bool>>
    {
        private readonly RoleManager<Role> _roleManager;
        private readonly ILogger<DeleteRoleCommandHandler> _logger;

        public DeleteRoleCommandHandler(
            RoleManager<Role> roleManager,
            ILogger<DeleteRoleCommandHandler> logger)
        {
            _roleManager = roleManager;
            _logger = logger;
        }

        public async Task<Result<bool>> Handle(DeleteRoleCommand request, CancellationToken cancellationToken)
        {
            // Tìm vai trò theo Id
            var role = await _roleManager.FindByIdAsync(request.Id.ToString());
            if (role == null)
            {
                return Result<bool>.NotFound($"Không tìm thấy vai trò với ID: {request.Id}");
            }

            // Kiểm tra xem vai trò có người dùng nào không
            if (role.UserRoles.Any())
            {
                return Result<bool>.BadRequest($"Không thể xóa vai trò '{role.Name}' vì đang được gán cho người dùng.");
            }

            // Xóa vai trò
            var result = await _roleManager.DeleteAsync(role);

            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                _logger.LogError("Lỗi khi xóa vai trò: {Errors}", errors);
                return Result<bool>.BadRequest($"Không thể xóa vai trò: {errors}");
            }

            _logger.LogInformation("Đã xóa vai trò: {RoleId}", request.Id);

            return Result<bool>.Success(true);
        }
    }
}


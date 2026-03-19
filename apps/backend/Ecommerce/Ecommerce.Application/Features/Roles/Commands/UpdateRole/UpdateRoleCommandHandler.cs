using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;

namespace Ecommerce.Application.Features.Roles.Commands.UpdateRole
{
    //[Authorize(Policy = "EditRole")]
    public class UpdateRoleCommandHandler : IRequestHandler<UpdateRoleCommand, Result<bool>>
    {
        private readonly RoleManager<Role> _roleManager;
        private readonly ILogger<UpdateRoleCommandHandler> _logger;

        public UpdateRoleCommandHandler(
            RoleManager<Role> roleManager,
            ILogger<UpdateRoleCommandHandler> logger)
        {
            _roleManager = roleManager;
            _logger = logger;
        }

        public async Task<Result<bool>> Handle(UpdateRoleCommand request, CancellationToken cancellationToken)
        {
            // Tìm vai trò theo Id
            var role = await _roleManager.FindByIdAsync(request.Id.ToString());
            if (role == null)
            {
                return Result<bool>.NotFound($"Không tìm thấy vai trò với ID: {request.Id}");
            }

            // Kiểm tra nếu tên mới khác tên cũ
            if (role.Name != request.Name)
            {
                // Kiểm tra nếu tên mới đã tồn tại
                var existingRole = await _roleManager.FindByNameAsync(request.Name);
                if (existingRole != null && existingRole.Id != role.Id)
                {
                    return Result<bool>.BadRequest($"Vai trò '{request.Name}' đã tồn tại trong hệ thống.");
                }

                // Cập nhật tên vai trò
                role.Name = request.Name;
                role.NormalizedName = request.Name.ToUpperInvariant();
                var result = await _roleManager.UpdateAsync(role);

                if (!result.Succeeded)
                {
                    var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                    _logger.LogError("Lỗi khi cập nhật vai trò: {Errors}", errors);
                    return Result<bool>.BadRequest($"Không thể cập nhật vai trò: {errors}");
                }
            }

            _logger.LogInformation("Đã cập nhật vai trò: {RoleId}", request.Id);

            return Result<bool>.Success(true);
        }
    }
}


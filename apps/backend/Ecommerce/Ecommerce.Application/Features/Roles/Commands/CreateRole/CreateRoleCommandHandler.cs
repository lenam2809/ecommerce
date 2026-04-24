using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Domain.Interfaces.Logging;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace Ecommerce.Application.Features.Roles.Commands.CreateRole
{
    //[Authorize(Policy = "CreateRole")]
    public class CreateRoleCommandHandler : IRequestHandler<CreateRoleCommand, Result<Guid>>
    {
        private readonly RoleManager<Role> _roleManager;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IEnhancedLogger _logger;

        public CreateRoleCommandHandler(
            RoleManager<Role> roleManager,
            IUnitOfWork unitOfWork,
            IEnhancedLogger logger)
        {
            _roleManager = roleManager;
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        public async Task<Result<Guid>> Handle(CreateRoleCommand request, CancellationToken cancellationToken)
        {
            // Kiểm tra xem vai trò đã tồn tại chưa
            var existingRole = await _roleManager.FindByNameAsync(request.Name);
            if (existingRole != null)
            {
                return Result<Guid>.BadRequest($"Vai trò '{request.Name}' đã tồn tại trong hệ thống.");
            }

            // Tạo vai trò mới
            var role = new Role
            {
                Name = request.Name,
            };

            // Thêm vào repository thông qua RoleManager
            var result = await _roleManager.CreateAsync(role);

            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                await _logger.LogAsync(
                    ELogLevel.Error,
                    "Role creation failed with errors {Errors}",
                    "CreateRole",
                    properties: new Dictionary<string, object?>
                    {
                        { "Errors", errors }
                    });
                return Result<Guid>.BadRequest($"Không thể tạo vai trò: {errors}");
            }

            await _logger.LogAsync(
                ELogLevel.Information,
                "Role created successfully for {RoleName}",
                "CreateRole",
                properties: new Dictionary<string, object?>
                {
                    { "RoleName", role.Name }
                });

            return Result<Guid>.Success(Guid.Parse(role.Id.ToString()));
        }
    }
}

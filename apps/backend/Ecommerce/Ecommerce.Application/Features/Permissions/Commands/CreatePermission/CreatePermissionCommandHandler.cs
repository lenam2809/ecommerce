using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Ecommerce.Application.Features.Permissions.Commands.CreatePermission
{
    public class CreatePermissionCommandHandler : IRequestHandler<CreatePermissionCommand, Result<Guid>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<CreatePermissionCommandHandler> _logger;

        public CreatePermissionCommandHandler(
            IUnitOfWork unitOfWork,
            ILogger<CreatePermissionCommandHandler> logger)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        public async Task<Result<Guid>> Handle(CreatePermissionCommand request, CancellationToken cancellationToken)
        {
            // Kiểm tra xem permission đã tồn tại chưa
            var existingPermission = await _unitOfWork.Permissions.GetByNameAsync(request.Name);
            if (existingPermission != null)
            {
                return Result<Guid>.BadRequest($"Quyền '{request.Name}' đã tồn tại trong hệ thống.");
            }

            // Tạo permission mới
            var permission = new Permission
            {
                Name = request.Name,
                Description = request.Description,
                Category = request.Category,
            };

            // Thêm vào repository
            await _unitOfWork.Permissions.AddAsync(permission, cancellationToken);

            // Lưu thay đổi
            await _unitOfWork.CompleteAsync(cancellationToken);

            _logger.LogInformation("Đã tạo permission mới: {PermissionName}", permission.Name);

            return Result<Guid>.Success(permission.Id);
        }
    }
}


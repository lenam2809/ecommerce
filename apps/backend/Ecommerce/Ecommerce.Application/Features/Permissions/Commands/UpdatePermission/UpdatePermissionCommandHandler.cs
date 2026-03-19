using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Interfaces;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Ecommerce.Application.Features.Permissions.Commands.UpdatePermission
{
    //[Authorize(Policy = "EditPermission")]
    public class UpdatePermissionCommandHandler : IRequestHandler<UpdatePermissionCommand, Result<bool>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<UpdatePermissionCommandHandler> _logger;

        public UpdatePermissionCommandHandler(
            IUnitOfWork unitOfWork,
            ILogger<UpdatePermissionCommandHandler> logger)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        public async Task<Result<bool>> Handle(UpdatePermissionCommand request, CancellationToken cancellationToken)
        {
            // Tìm permission cần cập nhật
            var permission = await _unitOfWork.Permissions.GetByIdAsync(request.Id);
            if (permission == null)
            {
                return Result<bool>.NotFound($"Không tìm thấy quyền với ID: {request.Id}");
            }

            // Kiểm tra xem tên mới đã tồn tại chưa (nếu có thay đổi)
            if (permission.Name != request.Name)
            {
                var existingPermission = await _unitOfWork.Permissions.GetByNameAsync(request.Name);
                if (existingPermission != null && existingPermission.Id != request.Id)
                {
                    return Result<bool>.BadRequest($"Quyền với tên '{request.Name}' đã tồn tại trong hệ thống.");
                }
            }

            // Cập nhật thông tin
            permission.Name = request.Name;
            permission.Description = request.Description;
            permission.Category = request.Category;

            // Lưu thay đổi
            _unitOfWork.Permissions.Update(permission);
            await _unitOfWork.CompleteAsync(cancellationToken);

            _logger.LogInformation("Đã cập nhật permission: {PermissionId}, {PermissionName}", permission.Id, permission.Name);

            return Result<bool>.Success(true);
        }
    }
}


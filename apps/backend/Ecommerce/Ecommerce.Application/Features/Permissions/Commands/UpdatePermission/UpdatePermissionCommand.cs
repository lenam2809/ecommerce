using Ecommerce.Application.Common.Models;
using MediatR;

namespace Ecommerce.Application.Features.Permissions.Commands.UpdatePermission
{
    /// <summary>
    /// Command cập nhật thông tin quyền
    /// </summary>
    public class UpdatePermissionCommand : IRequest<Result<bool>>
    {
        /// <summary>
        /// ID của quyền cần cập nhật
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// Tên quyền mới
        /// </summary>
        public required string Name { get; set; }

        /// <summary>
        /// Mô tả quyền mới
        /// </summary>
        public required string Description { get; set; }


        public string? Category { get; set; }
    }
}


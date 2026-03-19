using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Permissions.Dto;
using MediatR;

namespace Ecommerce.Application.Features.Permissions.Queries.GetPermissionsByUserId
{
    /// <summary>
    /// Query lấy danh sách quyền của một người dùng
    /// </summary>
    public class GetPermissionsByUserIdQuery : IRequest<Result<List<PermissionDto>>>
    {
        /// <summary>
        /// ID của người dùng cần lấy danh sách quyền
        /// </summary>
        public Guid UserId { get; set; }
    }
}


using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Permissions.Dto;
using MediatR;

namespace Ecommerce.Application.Features.Permissions.Queries.GetPermissionById
{
    /// <summary>
    /// Query lấy thông tin chi tiết của một quyền
    /// </summary>
    public class GetPermissionByIdQuery : IRequest<Result<PermissionDto>>
    {
        /// <summary>
        /// ID của quyền cần lấy thông tin
        /// </summary>
        public Guid Id { get; set; }
    }
}


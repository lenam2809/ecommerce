using Ecommerce.Application.Common.Models;
using MediatR;

namespace Ecommerce.Application.Features.Roles.Commands.CreateRole
{
    /// <summary>
    /// Command tạo vai trò mới
    /// </summary>
    public class CreateRoleCommand : IRequest<Result<Guid>>
    {
        /// <summary>
        /// Tên vai trò
        /// </summary>
        public string Name { get; set; }
    }
}


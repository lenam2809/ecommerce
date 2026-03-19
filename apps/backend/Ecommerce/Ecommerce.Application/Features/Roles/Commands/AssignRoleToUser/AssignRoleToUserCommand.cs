using Ecommerce.Application.Common.Models;
using MediatR;

namespace Ecommerce.Application.Features.Roles.Commands.AssignRoleToUser
{
    public class AssignRoleToUserCommand : IRequest<Result<bool>>
    {
        public Guid UserId { get; set; }
        public List<Guid> RoleIds { get; set; } = [];
    }
}


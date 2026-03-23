using Ecommerce.Application.Common.Models;
using MediatR;

namespace Ecommerce.Application.Features.Roles.Commands.UpdateRole
{
    public class UpdateRoleCommand : IRequest<Result<bool>>
    {
        public Guid Id { get; set; }
        public required string Name { get; set; }
        public List<string> Permissions { get; set; } = [];

    }
}


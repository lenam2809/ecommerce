using Ecommerce.Application.Common.Models;
using MediatR;

namespace Ecommerce.Application.Features.Roles.Commands.DeleteRole
{
    public class DeleteRoleCommand : IRequest<Result<bool>>
    {
        public Guid Id { get; set; }
    }
}


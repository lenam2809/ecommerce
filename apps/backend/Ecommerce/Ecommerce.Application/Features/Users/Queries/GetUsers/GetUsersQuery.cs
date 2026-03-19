using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Users.Dto;
using MediatR;

namespace Ecommerce.Application.Features.Users.Queries.GetUsers
{
    public class GetUsersQuery : IRequest<Result<List<UserDto>>>
    {
        public string RoleFilter { get; set; } = string.Empty;
    }
}


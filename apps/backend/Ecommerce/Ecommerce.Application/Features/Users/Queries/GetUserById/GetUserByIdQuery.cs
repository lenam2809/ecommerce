using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Users.Dto;
using MediatR;

namespace Ecommerce.Application.Features.Users.Queries.GetUserById
{
    public class GetUserByIdQuery : IRequest<Result<UserDto>>
    {
        public Guid Id { get; set; }
    }
}


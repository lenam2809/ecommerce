using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Auth.Dto;
using MediatR;

namespace Ecommerce.Application.Features.Auth.Commands.LoginUser
{
    public class LoginUserCommand : IRequest<Result<AuthResponseDto>>
    {
        public required string Email { get; set; }
        public required string Password { get; set; }
    }
}


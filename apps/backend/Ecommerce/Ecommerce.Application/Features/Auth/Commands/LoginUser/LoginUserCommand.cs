using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Auth.Dto;
using MediatR;

namespace Ecommerce.Application.Features.Auth.Commands.LoginUser
{
    public class LoginUserCommand : IRequest<Result<AuthResponseDto>>
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }
}


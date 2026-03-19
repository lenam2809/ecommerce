using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Auth.Dto;
using MediatR;

namespace Ecommerce.Application.Features.Auth.Commands.RefreshToken
{
    public class RefreshTokenCommand : IRequest<Result<AuthResponseDto>>
    {
        public string AccessToken { get; set; }
        public string RefreshToken { get; set; }
    }
}


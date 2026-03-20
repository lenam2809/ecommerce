using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Auth.Dto;
using MediatR;

namespace Ecommerce.Application.Features.Auth.Commands.RefreshToken
{
    public class RefreshTokenCommand : IRequest<Result<AuthResponseDto>>
    {
        public required string AccessToken { get; set; }
        public required string RefreshToken { get; set; }
    }
}


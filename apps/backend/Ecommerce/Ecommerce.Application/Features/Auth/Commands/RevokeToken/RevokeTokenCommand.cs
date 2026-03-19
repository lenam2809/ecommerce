using Ecommerce.Application.Common.Models;
using MediatR;

namespace Ecommerce.Application.Features.Auth.Commands.RevokeToken
{
    public class RevokeTokenCommand : IRequest<Result<bool>>
    {
        public required string RefreshToken { get; set; }
    }
}


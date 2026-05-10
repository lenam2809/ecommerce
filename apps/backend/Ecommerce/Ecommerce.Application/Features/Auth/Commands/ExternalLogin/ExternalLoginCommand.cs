using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Auth.Dto;
using MediatR;

namespace Ecommerce.Application.Features.Auth.Commands.ExternalLogin
{
    public sealed record ExternalLoginCommand(
        string Provider,
        string ProviderKey,
        string Email,
        string? FirstName,
        string? LastName,
        string? Picture,
        string? GuestId,
        string? UserAgent,
        string? IpAddress) : IRequest<Result<AuthResponseDto>>;
}

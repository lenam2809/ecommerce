using Ecommerce.Application.Common.Models;
using MediatR;

namespace Ecommerce.Application.Features.Auth.Commands.ResetPassword
{
    public record ResetPasswordCommand(
        string Token,
        string NewPassword,
        string ConfirmPassword) : IRequest<Result<string>>;
}

using FluentValidation;

namespace Ecommerce.Application.Features.Auth.Commands.RevokeToken
{
    public class RevokeTokenCommandValidator : AbstractValidator<RevokeTokenCommand>
    {
        public RevokeTokenCommandValidator()
        {
            RuleFor(v => v.RefreshToken)
                .NotEmpty().WithMessage("Refresh token là bắt buộc.");
        }
    }
}


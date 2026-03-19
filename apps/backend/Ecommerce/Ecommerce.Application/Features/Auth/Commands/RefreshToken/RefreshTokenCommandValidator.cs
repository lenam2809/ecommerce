using FluentValidation;

namespace Ecommerce.Application.Features.Auth.Commands.RefreshToken
{
    public class RefreshTokenCommandValidator : AbstractValidator<RefreshTokenCommand>
    {
        public RefreshTokenCommandValidator()
        {
            RuleFor(v => v.AccessToken)
                .NotEmpty().WithMessage("Access token là bắt buộc.");

            RuleFor(v => v.RefreshToken)
                .NotEmpty().WithMessage("Refresh token là bắt buộc.");
        }
    }
}


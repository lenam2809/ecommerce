using FluentValidation;

namespace Ecommerce.Application.Features.Auth.Commands.RefreshToken
{
    public class RefreshTokenCommandValidator : AbstractValidator<RefreshTokenCommand>
    {
        public RefreshTokenCommandValidator()
        {
            RuleFor(v => v.RefreshToken)
                .NotEmpty().WithMessage("Refresh token là bắt buộc.");
        }
    }
}


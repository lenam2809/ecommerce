using FluentValidation;

namespace Ecommerce.Application.Features.Auth.Commands.LoginUser
{
    public class LoginUserCommandValidator : AbstractValidator<LoginUserCommand>
    {
        public LoginUserCommandValidator()
        {
            RuleFor(v => v.Email)
                .NotEmpty().WithMessage("Email là bắt buộc.")
                .EmailAddress().WithMessage("Email phải là địa chỉ email hợp lệ.");

            RuleFor(v => v.Password)
                .NotEmpty().WithMessage("Mật khẩu là bắt buộc.");
        }
    }
}


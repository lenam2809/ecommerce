using FluentValidation;

namespace Ecommerce.Application.Features.Auth.Commands.RegisterUser
{
    public class RegisterCommandValidator : AbstractValidator<RegisterCommand>
    {
        public RegisterCommandValidator()
        {
            RuleFor(v => v.Email)
                .NotEmpty().WithMessage("Email là bắt buộc.")
                .EmailAddress().WithMessage("Email phải là địa chỉ email hợp lệ.");

            RuleFor(v => v.Password)
                .NotEmpty().WithMessage("Mật khẩu là bắt buộc.")
                .MinimumLength(6).WithMessage("Mật khẩu phải có ít nhất 6 ký tự.");

            RuleFor(v => v.FirstName)
                .NotEmpty().WithMessage("Họ là bắt buộc.")
                .MaximumLength(50).WithMessage("Họ không được vượt quá 50 ký tự.");

            RuleFor(v => v.LastName)
                .NotEmpty().WithMessage("Tên là bắt buộc.")
                .MaximumLength(50).WithMessage("Tên không được vượt quá 50 ký tự.");
        }
    }
}


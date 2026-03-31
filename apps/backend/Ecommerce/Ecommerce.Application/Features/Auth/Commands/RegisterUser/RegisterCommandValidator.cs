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
                .MinimumLength(12).WithMessage("Mật khẩu phải có ít nhất 12 ký tự.")
                .Matches(@"[A-Z]+").WithMessage("Mật khẩu phải chứa ít nhất 1 chữ HOA.")
                .Matches(@"[a-z]+").WithMessage("Mật khẩu phải chứa ít nhất 1 chữ thường.")
                .Matches(@"[0-9]+").WithMessage("Mật khẩu phải chứa ít nhất 1 chữ số.")
                .Matches(@"[\!\?\*\.\@\#\$\%\^\&\+\=\-\_]+").WithMessage("Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt (!?*.@#$%^&+=-_).");

            RuleFor(v => v.FirstName)
                .NotEmpty().WithMessage("Họ là bắt buộc.")
                .MaximumLength(50).WithMessage("Họ không được vượt quá 50 ký tự.");

            RuleFor(v => v.LastName)
                .NotEmpty().WithMessage("Tên là bắt buộc.")
                .MaximumLength(50).WithMessage("Tên không được vượt quá 50 ký tự.");
        }
    }
}


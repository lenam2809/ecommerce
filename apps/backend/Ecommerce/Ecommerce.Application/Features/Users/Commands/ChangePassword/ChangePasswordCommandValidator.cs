using FluentValidation;

namespace Ecommerce.Application.Features.Users.Commands.ChangePassword
{
    /// <summary>
    /// Lớp xác thực dữ liệu cho ChangePasswordCommand
    /// </summary>
    public class ChangePasswordCommandValidator : AbstractValidator<ChangePasswordCommand>
    {
        public ChangePasswordCommandValidator()
        {
            RuleFor(v => v.UserId)
                .NotEmpty().WithMessage("ID người dùng không được để trống.");

            RuleFor(v => v.CurrentPassword)
                .NotEmpty().WithMessage("Mật khẩu hiện tại không được để trống.");

            RuleFor(v => v.NewPassword)
                .NotEmpty().WithMessage("Mật khẩu mới không được để trống.")
                .MinimumLength(6).WithMessage("Mật khẩu mới phải có ít nhất 6 ký tự.")
                .Matches("[A-Z]").WithMessage("Mật khẩu mới phải chứa ít nhất một chữ hoa.")
                .Matches("[a-z]").WithMessage("Mật khẩu mới phải chứa ít nhất một chữ thường.")
                .Matches("[0-9]").WithMessage("Mật khẩu mới phải chứa ít nhất một chữ số.")
                .Matches("[^a-zA-Z0-9]").WithMessage("Mật khẩu mới phải chứa ít nhất một ký tự đặc biệt.")
                .NotEqual(x => x.CurrentPassword).WithMessage("Mật khẩu mới không được trùng với mật khẩu hiện tại.");

            RuleFor(v => v.ConfirmNewPassword)
                .Equal(x => x.NewPassword).WithMessage("Mật khẩu xác nhận không khớp với mật khẩu mới.");
        }
    }
}


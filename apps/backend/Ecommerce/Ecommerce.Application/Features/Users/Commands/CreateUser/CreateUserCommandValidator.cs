using Ecommerce.Domain.Enums;
using FluentValidation;

namespace Ecommerce.Application.Features.Users.Commands.CreateUser
{
    /// <summary>
    /// Lớp xác thực dữ liệu cho CreateUserCommand
    /// </summary>
    public class CreateUserCommandValidator : AbstractValidator<CreateUserCommand>
    {
        public CreateUserCommandValidator()
        {
            RuleFor(v => v.Email)
                .NotEmpty().WithMessage("Email không được để trống.")
                .EmailAddress().WithMessage("Email phải có định dạng hợp lệ.");

            RuleFor(v => v.Password)
                .NotEmpty().WithMessage("Mật khẩu không được để trống.")
                .MinimumLength(6).WithMessage("Mật khẩu phải có ít nhất 6 ký tự.")
                .Matches("[A-Z]").WithMessage("Mật khẩu phải chứa ít nhất một chữ hoa.")
                .Matches("[a-z]").WithMessage("Mật khẩu phải chứa ít nhất một chữ thường.")
                .Matches("[0-9]").WithMessage("Mật khẩu phải chứa ít nhất một chữ số.")
                .Matches("[^a-zA-Z0-9]").WithMessage("Mật khẩu phải chứa ít nhất một ký tự đặc biệt.");

            RuleFor(v => v.FirstName)
                .NotEmpty().WithMessage("Tên không được để trống.")
                .MaximumLength(50).WithMessage("Tên không được vượt quá 50 ký tự.")
                .Matches(@"^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễếệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ\s]+$")
                .WithMessage("Tên chỉ được chứa chữ cái và khoảng trắng.");

            RuleFor(v => v.LastName)
                .NotEmpty().WithMessage("Họ không được để trống.")
                .MaximumLength(50).WithMessage("Họ không được vượt quá 50 ký tự.")
                .Matches(@"^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễếệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ\s]+$")
                .WithMessage("Họ chỉ được chứa chữ cái và khoảng trắng.");

            RuleFor(v => v.Role)
                .NotEmpty().WithMessage("Vai trò không được để trống.")
                .Must(role => role == EUserRoles.Admin || role == EUserRoles.Staff || role == EUserRoles.Customer)
                .WithMessage($"Vai trò phải là một trong các giá trị: {EUserRoles.Admin}, {EUserRoles.Staff}, {EUserRoles.Customer}.");

            RuleFor(v => v.PhoneNumber)
                .Matches(@"^(0|\+84)[3|5|7|8|9][0-9]{8}$")
                .WithMessage("Số điện thoại không đúng định dạng.")
                .When(x => !string.IsNullOrEmpty(x.PhoneNumber));

            // Xác thực các trường khác nếu cần
            RuleFor(v => v.CustomerLevel)
                .IsInEnum().WithMessage("Cấp độ khách hàng không hợp lệ.");

            RuleFor(v => v.Status)
                .IsInEnum().WithMessage("Trạng thái người dùng không hợp lệ.");

            RuleFor(v => v.PromotionPoints)
                .GreaterThanOrEqualTo(0).WithMessage("Điểm thưởng không được âm.");
        }
    }
}

using FluentValidation;

namespace Ecommerce.Application.Features.Account.Commands.UpdateProfile
{
    /// <summary>
    /// Lớp xác thực dữ liệu cho UpdateProfileCommand
    /// </summary>
    public class UpdateProfileCommandValidator : AbstractValidator<UpdateProfileCommand>
    {
        public UpdateProfileCommandValidator()
        {

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

            RuleFor(v => v.PhoneNumber)
                .Matches(@"^(0|\+84)[3|5|7|8|9][0-9]{8}$")
                .WithMessage("Số điện thoại không đúng định dạng.")
                .When(x => !string.IsNullOrEmpty(x.PhoneNumber));

        }
    }
}


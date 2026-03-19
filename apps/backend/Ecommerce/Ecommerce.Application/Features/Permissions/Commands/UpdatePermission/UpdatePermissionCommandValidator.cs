using FluentValidation;

namespace Ecommerce.Application.Features.Permissions.Commands.UpdatePermission
{
    public class UpdatePermissionCommandValidator : AbstractValidator<UpdatePermissionCommand>
    {
        public UpdatePermissionCommandValidator()
        {
            RuleFor(v => v.Id)
                .NotEmpty().WithMessage("ID quyền không được để trống.");

            RuleFor(v => v.Name)
                .NotEmpty().WithMessage("Tên quyền không được để trống.")
                .MaximumLength(100).WithMessage("Tên quyền không được vượt quá 100 ký tự.")
                .Matches(@"^[a-zA-Z0-9_:]+$").WithMessage("Tên quyền chỉ được chứa chữ cái, số và dấu gạch dưới.");

            RuleFor(v => v.Description)
                .NotEmpty().WithMessage("Mô tả quyền không được để trống.")
                .MaximumLength(500).WithMessage("Mô tả quyền không được vượt quá 500 ký tự.");
        }
    }
}


using FluentValidation;

namespace Ecommerce.Application.Features.Roles.Commands.CreateRole
{
    public class CreateRoleCommandValidator : AbstractValidator<CreateRoleCommand>
    {
        public CreateRoleCommandValidator()
        {
            RuleFor(v => v.Name)
                .NotEmpty().WithMessage("Tên vai trò không được để trống.")
                .MaximumLength(100).WithMessage("Tên vai trò không được vượt quá 100 ký tự.")
                .Matches(@"^[a-zA-Z0-9_]+$").WithMessage("Tên vai trò chỉ được chứa chữ cái, số và dấu gạch dưới.");
        }
    }
}


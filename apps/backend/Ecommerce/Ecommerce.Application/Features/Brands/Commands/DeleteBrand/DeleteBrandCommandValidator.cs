using FluentValidation;

namespace Ecommerce.Application.Features.Brands.Commands.DeleteBrand
{
    public class DeleteBrandCommandValidator : AbstractValidator<DeleteBrandCommand>
    {
        public DeleteBrandCommandValidator()
        {
            RuleFor(v => v.Id)
            .NotEmpty()
            .WithMessage("ID thương hiệu không được để trống.");
        }
    }
}


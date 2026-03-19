using Ecommerce.Domain.Interfaces;
using FluentValidation;

namespace Ecommerce.Application.Features.Brands.Commands.CreateBrand
{
    public class CreateBrandCommandValidator : AbstractValidator<CreateBrandCommand>
    {
        private readonly IBrandRepository _brandRepository;

        public CreateBrandCommandValidator(IBrandRepository brandRepository)
        {
            _brandRepository = brandRepository;

            RuleFor(c => c.Code)
               .NotEmpty().WithMessage("Mã thương hiệu không được để trống")
               .MaximumLength(20).WithMessage("Mã thương hiệu không được vượt quá 20 ký tự")
               .MustAsync(async (code, cancellation) => await _brandRepository.IsCodeUniqueAsync(code, cancellationToken: cancellation))
               .WithMessage("Mã thương hiệu đã tồn tại");

            RuleFor(v => v.Name)
                .NotEmpty().WithMessage("Tên thương hiệu là bắt buộc.")
                .MaximumLength(100).WithMessage("Tên thương hiệu không được vượt quá 100 ký tự.");

            RuleFor(v => v.Description)
                .MaximumLength(500).WithMessage("Mô tả không được vượt quá 500 ký tự.");

        }
    }
}

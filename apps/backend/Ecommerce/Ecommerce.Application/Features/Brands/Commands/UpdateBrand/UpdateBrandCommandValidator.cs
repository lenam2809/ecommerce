using Ecommerce.Domain.Interfaces;
using FluentValidation;

namespace Ecommerce.Application.Features.Brands.Commands.UpdateBrand
{
    public class UpdateBrandCommandValidator : AbstractValidator<UpdateBrandCommand>
    {
        private readonly IBrandRepository _brandRepository;
        public UpdateBrandCommandValidator(IBrandRepository brandRepository)
        {
            _brandRepository = brandRepository;

            RuleFor(v => v.Id)
                .NotEmpty()
                .WithMessage("Id thương hiệu không được để trống");

            RuleFor(c => c.Code)
                           .NotEmpty().WithMessage("Mã thương hiệu không được để trống")
                           .MaximumLength(20).WithMessage("Mã thương hiệu không được vượt quá 20 ký tự")
                           .MustAsync(async (model, code, cancellation) => await _brandRepository.IsCodeUniqueAsync(code, model.Id, cancellationToken: cancellation))
                           .WithMessage("Mã thương hiệu đã tồn tại");

            RuleFor(v => v.Name)
                .NotEmpty().WithMessage("Tên thương hiệu là bắt buộc.")
                .MaximumLength(100).WithMessage("Tên thương hiệu không được vượt quá 100 ký tự.");

            RuleFor(v => v.Description)
                .MaximumLength(500).WithMessage("Mô tả không được vượt quá 500 ký tự.");


        }
    }
}


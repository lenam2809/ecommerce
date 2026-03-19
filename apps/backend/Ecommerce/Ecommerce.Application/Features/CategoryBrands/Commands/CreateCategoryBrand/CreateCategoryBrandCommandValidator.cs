using Ecommerce.Domain.Interfaces;
using FluentValidation;

namespace Ecommerce.Application.Features.CategoryBrands.Commands.CreateCategoryBrand
{
    public class CreateCategoryBrandCommandValidator : AbstractValidator<CreateCategoryBrandCommand>
    {
        private readonly ICategoryRepository _categoryRepository;
        private readonly IBrandRepository _brandRepository;

        public CreateCategoryBrandCommandValidator(
            ICategoryRepository categoryRepository,
            IBrandRepository brandRepository)
        {
            _categoryRepository = categoryRepository;
            _brandRepository = brandRepository;

            RuleFor(x => x.CategoryId)
                .NotEmpty().WithMessage("CategoryId là bắt buộc")
                .MustAsync(async (id, cancellation) => await _categoryRepository.ExistsAsync(id, cancellation))
                .WithMessage("Danh mục không tồn tại");

            RuleFor(x => x.BrandId)
                .NotEmpty().WithMessage("BrandId là bắt buộc")
                .MustAsync(async (id, cancellation) => await _brandRepository.ExistsAsync(id, cancellation))
                .WithMessage("Thương hiệu không tồn tại");
        }
    }
}


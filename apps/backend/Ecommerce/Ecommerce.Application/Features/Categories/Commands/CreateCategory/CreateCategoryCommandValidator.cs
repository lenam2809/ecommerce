using Ecommerce.Domain.Interfaces;
using FluentValidation;

namespace Ecommerce.Application.Features.Categories.Commands.CreateCategory
{
    public class CreateCategoryCommandValidator : AbstractValidator<CreateCategoryCommand>
    {
        private readonly ICategoryRepository _categoryRepository;

        public CreateCategoryCommandValidator(ICategoryRepository categoryRepository)
        {
            _categoryRepository = categoryRepository;

            RuleFor(c => c.Code)
                .NotEmpty().WithMessage("Mã danh mục không được để trống")
                .MaximumLength(50).WithMessage("Mã danh mục không được vượt quá 50 ký tự")
                .MustAsync(async (code, cancellation) => await _categoryRepository.IsCodeUniqueAsync(code))
                .WithMessage("Mã danh mục đã tồn tại");

            RuleFor(c => c.Name)
                .NotEmpty().WithMessage("Tên danh mục không được để trống")
                .MaximumLength(255).WithMessage("Tên danh mục không được vượt quá 255 ký tự");

            RuleFor(c => c.Description)
                .MaximumLength(1000).WithMessage("Mô tả không được vượt quá 1000 ký tự");

            RuleFor(c => c.ParentId)
                .MustAsync(async (id, cancellation) => !id.HasValue || await _categoryRepository.ExistsAsync(id.Value, cancellation))
                .WithMessage("Danh mục cha không tồn tại")
                .When(c => c.ParentId.HasValue);

            RuleFor(p => p.Image)
                .Must(file => file == null || file.Length <= 10 * 1024 * 1024)
                .WithMessage("Kích thước hình ảnh không được vượt quá 10MB");
        }
    }
}


using Ecommerce.Domain.Interfaces;
using FluentValidation;

namespace Ecommerce.Application.Features.Categories.Commands.UpdateCategory
{
    public class UpdateCategoryCommandValidator : AbstractValidator<UpdateCategoryCommand>
    {
        private readonly ICategoryRepository _categoryRepository;

        public UpdateCategoryCommandValidator(ICategoryRepository categoryRepository)
        {
            _categoryRepository = categoryRepository;

            RuleFor(c => c.Id)
                .NotEmpty().WithMessage("ID danh mục không được để trống")
                .MustAsync(async (id, cancellation) => await _categoryRepository.ExistsAsync(id, cancellation))
                .WithMessage("Danh mục không tồn tại");

            RuleFor(c => c.Code)
                .NotEmpty().WithMessage("Mã danh mục không được để trống")
                .MaximumLength(50).WithMessage("Mã danh mục không được vượt quá 50 ký tự")
                .MustAsync(async (model, code, cancellation) => await _categoryRepository.IsCodeUniqueAsync(code, model.Id, cancellation))
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

            RuleFor(c => c.Image)
                .Must(file => file == null || file.Length <= 5 * 1024 * 1024)
                .WithMessage("Kích thước hình ảnh không được vượt quá 5MB");
        }
    }
}


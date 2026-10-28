using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces;
using FluentValidation;

namespace Ecommerce.Application.Features.Products.Commands.UpdateProductAddOn
{
    public class UpdateProductAddOnCommandValidator : AbstractValidator<UpdateProductAddOnCommand>
    {
        private readonly IUnitOfWork _unitOfWork;

        public UpdateProductAddOnCommandValidator(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;

            RuleFor(x => x.Id)
                .NotEmpty().WithMessage("ID gói dịch vụ không được để trống");

            RuleFor(x => x.Code)
                .NotEmpty().WithMessage("Mã gói dịch vụ không được để trống")
                .MaximumLength(50).WithMessage("Mã gói dịch vụ không được vượt quá 50 ký tự")
                .MustAsync(async (command, code, cancellationToken) =>
                {
                    var exists = await _unitOfWork.BaseRepository<ProductAddOn>()
                        .AnyAsync(a => a.Code == code && a.Id != command.Id, cancellationToken);
                    return !exists;
                }).WithMessage("Mã gói dịch vụ đã tồn tại trong hệ thống");

            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Tên gói dịch vụ không được để trống")
                .MaximumLength(255).WithMessage("Tên gói dịch vụ không được vượt quá 255 ký tự");

            RuleFor(x => x.AddOnType)
                .NotEmpty().WithMessage("Loại gói dịch vụ không được để trống")
                .MaximumLength(50).WithMessage("Loại gói dịch vụ không được vượt quá 50 ký tự");

            RuleFor(x => x.Price)
                .GreaterThanOrEqualTo(0).WithMessage("Giá gói dịch vụ không được âm");

            RuleFor(x => x.OriginalPrice)
                .GreaterThanOrEqualTo(0).WithMessage("Giá gốc không được âm")
                .When(x => x.OriginalPrice.HasValue);

            RuleFor(x => x.DurationMonths)
                .GreaterThanOrEqualTo(0).WithMessage("Thời hạn bảo hành (tháng) không được âm")
                .When(x => x.DurationMonths.HasValue);
        }
    }
}

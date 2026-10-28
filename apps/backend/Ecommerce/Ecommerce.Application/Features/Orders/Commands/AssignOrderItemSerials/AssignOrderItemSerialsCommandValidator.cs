using FluentValidation;

namespace Ecommerce.Application.Features.Orders.Commands.AssignOrderItemSerials
{
    public class AssignOrderItemSerialsCommandValidator : AbstractValidator<AssignOrderItemSerialsCommand>
    {
        public AssignOrderItemSerialsCommandValidator()
        {
            RuleFor(x => x.OrderId)
                .NotEmpty().WithMessage("Mã đơn hàng là bắt buộc");

            RuleFor(x => x.OrderItemId)
                .NotEmpty().WithMessage("Mã mục hàng là bắt buộc");

            RuleFor(x => x.SerialNumber)
                .NotEmpty().WithMessage("Mã Serial/IMEI không được để trống")
                .MaximumLength(100).WithMessage("Mã Serial không vượt quá 100 ký tự");

            RuleFor(x => x.Imei)
                .MaximumLength(50).WithMessage("Mã IMEI không vượt quá 50 ký tự");

            RuleFor(x => x.WarrantyMonths)
                .GreaterThan(0).WithMessage("Số tháng bảo hành phải lớn hơn 0")
                .When(x => x.WarrantyMonths.HasValue);
        }
    }
}

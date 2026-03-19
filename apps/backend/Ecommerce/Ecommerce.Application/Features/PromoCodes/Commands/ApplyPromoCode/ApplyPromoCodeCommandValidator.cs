using FluentValidation;

namespace Ecommerce.Application.Features.PromoCodes.Commands.ApplyPromoCode
{
    public class ApplyPromoCodeCommandValidator : AbstractValidator<ApplyPromoCodeCommand>
    {
        public ApplyPromoCodeCommandValidator()
        {
            RuleFor(p => p.Code)
                .NotEmpty().WithMessage("Mã giảm giá không được để trống");

            RuleFor(p => p.OrderTotal)
                .GreaterThan(0).WithMessage("Tổng giá trị đơn hàng phải lớn hơn 0");
        }
    }
}


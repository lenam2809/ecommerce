using FluentValidation;

namespace Ecommerce.Application.Features.Cart.Commands.ApplyPromoCode
{
    public class ApplyPromoCodeCommandValidator : AbstractValidator<ApplyPromoCodeCommand>
    {
        public ApplyPromoCodeCommandValidator()
        {
            RuleFor(v => v.Code)
                .NotEmpty().WithMessage("Mã khuyến mãi là bắt buộc");
        }
    }
}


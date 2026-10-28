using FluentValidation;

namespace Ecommerce.Application.Features.Orders.Commands.ActivateOrderWarranty
{
    public class ActivateOrderWarrantyCommandValidator : AbstractValidator<ActivateOrderWarrantyCommand>
    {
        public ActivateOrderWarrantyCommandValidator()
        {
            RuleFor(x => x.OrderId)
                .NotEmpty().WithMessage("Mã đơn hàng là bắt buộc");
        }
    }
}

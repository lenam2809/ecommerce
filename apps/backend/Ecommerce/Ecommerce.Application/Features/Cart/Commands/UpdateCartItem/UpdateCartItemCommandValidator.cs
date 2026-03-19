using FluentValidation;

namespace Ecommerce.Application.Features.Cart.Commands.UpdateCartItem
{
    public class UpdateCartItemCommandValidator : AbstractValidator<UpdateCartItemCommand>
    {
        public UpdateCartItemCommandValidator()
        {
            RuleFor(v => v.ItemId)
                .NotEmpty().WithMessage("ItemId là bắt buộc");

            RuleFor(v => v.Quantity)
                .GreaterThanOrEqualTo(0).WithMessage("Số lượng phải lớn hơn hoặc bằng 0");
        }
    }
}


using FluentValidation;

namespace Ecommerce.Application.Features.Cart.Commands.AddToCart
{
    public class AddToCartCommandValidator : AbstractValidator<AddToCartCommand>
    {
        public AddToCartCommandValidator()
        {
            RuleFor(v => v.ProductId)
                .NotEmpty().WithMessage("ProductId là bắt buộc");

            RuleFor(v => v.Quantity)
                .GreaterThan(0).WithMessage("Số lượng phải lớn hơn 0");
        }
    }
}


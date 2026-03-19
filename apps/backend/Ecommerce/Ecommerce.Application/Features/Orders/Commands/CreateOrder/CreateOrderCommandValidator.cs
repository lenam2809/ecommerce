using FluentValidation;

namespace Ecommerce.Application.Features.Orders.Commands.CreateOrder
{
    public class CreateOrderCommandValidator : AbstractValidator<CreateOrderCommand>
    {
        public CreateOrderCommandValidator()
        {
            RuleFor(o => o.ShippingAddress)
                .NotEmpty().WithMessage("Địa chỉ giao hàng là bắt buộc")
                .MaximumLength(500).WithMessage("Địa chỉ giao hàng không được vượt quá 500 ký tự");

            RuleFor(o => o.Phone)
                .NotEmpty().WithMessage("Số điện thoại là bắt buộc")
                .Matches(@"^\+?[0-9]{8,15}$").WithMessage("Định dạng số điện thoại không hợp lệ");

            RuleFor(o => o.Email)
                .NotEmpty().WithMessage("Email là bắt buộc")
                .EmailAddress().WithMessage("Định dạng email không hợp lệ");

            RuleFor(o => o.DeliveryInstructions)
                .MaximumLength(500).WithMessage("Hướng dẫn giao hàng không được vượt quá 500 ký tự");

            RuleFor(o => o.OrderItems)
                .NotEmpty().WithMessage("Đơn hàng phải có ít nhất một sản phẩm");

            RuleForEach(o => o.OrderItems).ChildRules(item =>
            {
                item.RuleFor(i => i.ProductId)
                    .NotEmpty().WithMessage("Mã sản phẩm là bắt buộc");

                item.RuleFor(i => i.Quantity)
                    .GreaterThan(0).WithMessage("Số lượng phải lớn hơn 0");
            });
        }
    }
}


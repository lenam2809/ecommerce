using FluentValidation;

namespace Ecommerce.Application.Features.Orders.Commands.UpdateOrder
{
    public class UpdateOrderCommandValidator : AbstractValidator<UpdateOrderCommand>
    {
        public UpdateOrderCommandValidator()
        {


            RuleFor(v => v.ShippingAddress)
                .NotEmpty().WithMessage("Địa chỉ giao hàng là bắt buộc.")
                .MaximumLength(200).WithMessage("Địa chỉ giao hàng không được vượt quá 200 ký tự.");

            RuleFor(v => v.Phone)
                .NotEmpty().WithMessage("Số điện thoại là bắt buộc.")
                .MaximumLength(20).WithMessage("Số điện thoại không được vượt quá 20 ký tự.");

            RuleFor(v => v.Email)
                .NotEmpty().WithMessage("Email là bắt buộc.")
                .EmailAddress().WithMessage("Email phải có định dạng hợp lệ.")
                .MaximumLength(100).WithMessage("Email không được vượt quá 100 ký tự.");

        }
    }
}


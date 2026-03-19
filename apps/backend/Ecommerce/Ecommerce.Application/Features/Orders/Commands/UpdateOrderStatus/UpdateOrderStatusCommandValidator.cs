using Ecommerce.Domain.Enums;
using FluentValidation;

namespace Ecommerce.Application.Features.Orders.Commands.UpdateOrderStatus
{
    public class UpdateOrderStatusCommandValidator : AbstractValidator<UpdateOrderStatusCommand>
    {
        public UpdateOrderStatusCommandValidator()
        {
            RuleFor(o => o.Id)
                .NotEmpty().WithMessage("Mã đơn hàng là bắt buộc");

            RuleFor(o => o.Status)
                .IsInEnum().WithMessage("Trạng thái đơn hàng không hợp lệ");

            // Validate ngày giao hàng dự kiến nếu trạng thái là Đang xử lý hoặc Đang giao
            RuleFor(o => o.ExpectedDeliveryDate)
                .NotNull().WithMessage("Ngày giao hàng dự kiến là bắt buộc cho trạng thái Đang xử lý hoặc Đang giao")
                .GreaterThan(DateTime.Now).WithMessage("Ngày giao hàng dự kiến phải ở trong tương lai")
                .When(o => o.Status == EOrderStatus.Processing || o.Status == EOrderStatus.Shipped);
        }
    }
}


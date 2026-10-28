using Ecommerce.Domain.Enums;
using FluentValidation;

namespace Ecommerce.Application.Features.Orders.Commands.UpdateOrderDepositStatus
{
    public class UpdateOrderDepositStatusCommandValidator : AbstractValidator<UpdateOrderDepositStatusCommand>
    {
        public UpdateOrderDepositStatusCommandValidator()
        {
            RuleFor(x => x.OrderId)
                .NotEmpty().WithMessage("Mã đơn hàng là bắt buộc");

            RuleFor(x => x.DepositStatus)
                .IsInEnum().WithMessage("Trạng thái cọc không hợp lệ");

            RuleFor(x => x.DepositAmount)
                .GreaterThanOrEqualTo(0).WithMessage("Số tiền cọc không được âm")
                .When(x => x.DepositAmount.HasValue);

            RuleFor(x => x.CarrierName)
                .MaximumLength(100).WithMessage("Tên đơn vị vận chuyển không vượt quá 100 ký tự");

            RuleFor(x => x.TrackingNumber)
                .MaximumLength(100).WithMessage("Mã vận đơn không vượt quá 100 ký tự");

            RuleFor(x => x.DriverName)
                .MaximumLength(100).WithMessage("Tên tài xế không vượt quá 100 ký tự");

            RuleFor(x => x.DriverPhone)
                .MaximumLength(20).WithMessage("Số điện thoại tài xế không vượt quá 20 ký tự");
        }
    }
}

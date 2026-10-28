using FluentValidation;

namespace Ecommerce.Application.Features.Orders.Commands.RemoveOrderItemSerial
{
    public class RemoveOrderItemSerialCommandValidator : AbstractValidator<RemoveOrderItemSerialCommand>
    {
        public RemoveOrderItemSerialCommandValidator()
        {
            RuleFor(x => x.OrderId)
                .NotEmpty().WithMessage("Mã đơn hàng là bắt buộc");

            RuleFor(x => x.SerialId)
                .NotEmpty().WithMessage("Mã bản ghi Serial là bắt buộc");
        }
    }
}

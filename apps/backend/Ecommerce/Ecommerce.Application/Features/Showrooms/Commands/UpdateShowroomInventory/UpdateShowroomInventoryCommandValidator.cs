using FluentValidation;

namespace Ecommerce.Application.Features.Showrooms.Commands.UpdateShowroomInventory
{
    public class UpdateShowroomInventoryCommandValidator : AbstractValidator<UpdateShowroomInventoryCommand>
    {
        public UpdateShowroomInventoryCommandValidator()
        {
            RuleFor(x => x.ShowroomId)
                .NotEmpty().WithMessage("ShowroomId không được để trống");

            RuleFor(x => x.ProductId)
                .NotEmpty().WithMessage("ProductId không được để trống");

            RuleFor(x => x.Quantity)
                .GreaterThanOrEqualTo(0).WithMessage("Số lượng tồn kho (Quantity) không được âm");

            RuleFor(x => x.ReservedQuantity)
                .GreaterThanOrEqualTo(0).WithMessage("Số lượng giữ chỗ (ReservedQuantity) không được âm");

            RuleFor(x => x)
                .Must(x => x.Quantity >= x.ReservedQuantity)
                .WithMessage("Số lượng tồn kho không được nhỏ hơn số lượng đang giữ chỗ");
        }
    }
}

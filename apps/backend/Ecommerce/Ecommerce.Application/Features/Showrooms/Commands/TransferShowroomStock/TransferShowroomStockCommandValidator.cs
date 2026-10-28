using FluentValidation;

namespace Ecommerce.Application.Features.Showrooms.Commands.TransferShowroomStock
{
    public class TransferShowroomStockCommandValidator : AbstractValidator<TransferShowroomStockCommand>
    {
        public TransferShowroomStockCommandValidator()
        {
            RuleFor(x => x.FromShowroomId)
                .NotEmpty().WithMessage("Showroom xuất (FromShowroomId) không được để trống");

            RuleFor(x => x.ToShowroomId)
                .NotEmpty().WithMessage("Showroom nhận (ToShowroomId) không được để trống");

            RuleFor(x => x)
                .Must(x => x.FromShowroomId != x.ToShowroomId)
                .WithMessage("Showroom xuất và showroom nhận không được trùng nhau");

            RuleFor(x => x.ProductId)
                .NotEmpty().WithMessage("ProductId không được để trống");

            RuleFor(x => x.Quantity)
                .GreaterThan(0).WithMessage("Số lượng điều chuyển phải lớn hơn 0");
        }
    }
}

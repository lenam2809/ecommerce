using FluentValidation;

namespace Ecommerce.Application.Features.Promotions.Commands.UpdateFlashSale
{
    public class UpdateFlashSaleCommandValidator : AbstractValidator<UpdateFlashSaleCommand>
    {
        public UpdateFlashSaleCommandValidator()
        {
            RuleFor(x => x.Id)
                .NotEmpty()
                .WithMessage("Mã định danh chiến dịch không được để trống.");

            RuleFor(x => x.Title)
                .NotEmpty()
                .WithMessage("Tiêu đề chiến dịch Flash Sale không được để trống.")
                .MaximumLength(200)
                .WithMessage("Tiêu đề không được vượt quá 200 ký tự.");

            RuleFor(x => x.StartTime)
                .NotEmpty()
                .WithMessage("Thời gian bắt đầu là bắt buộc.");

            RuleFor(x => x.EndTime)
                .NotEmpty()
                .WithMessage("Thời gian kết thúc là bắt buộc.")
                .GreaterThan(x => x.StartTime)
                .WithMessage("Thời gian kết thúc phải sau thời gian bắt đầu.");

            RuleForEach(x => x.Items).ChildRules(item =>
            {
                item.RuleFor(i => i.ProductId)
                    .NotEmpty()
                    .WithMessage("Sản phẩm trong Flash Sale không được để trống.");

                item.RuleFor(i => i.FlashSalePrice)
                    .GreaterThan(0)
                    .WithMessage("Giá Flash Sale phải lớn hơn 0.")
                    .LessThanOrEqualTo(i => i.OriginalPrice)
                    .When(i => i.OriginalPrice > 0)
                    .WithMessage("Giá Flash Sale phải nhỏ hơn hoặc bằng giá gốc.");

                item.RuleFor(i => i.TotalQuota)
                    .GreaterThan(0)
                    .WithMessage("Số lượng mở bán Flash Sale phải lớn hơn 0.");
            });
        }
    }
}

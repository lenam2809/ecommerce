using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces;
using FluentValidation;

namespace Ecommerce.Application.Features.PromoCodes.Commands.UpdatePromoCode
{
    public class UpdatePromoCodeCommandValidator : AbstractValidator<UpdatePromoCodeCommand>
    {
        private readonly IPromoCodeRepository _promoCodeRepository;

        public UpdatePromoCodeCommandValidator(IPromoCodeRepository promoCodeRepository)
        {
            _promoCodeRepository = promoCodeRepository;

            RuleFor(p => p.Id)
                .NotEmpty().WithMessage("ID không được để trống");

            RuleFor(p => p.Code)
                .NotEmpty().WithMessage("Mã khuyến mãi không được để trống")
                .MaximumLength(20).WithMessage("Mã khuyến mãi không được vượt quá 20 ký tự")
                .MustAsync(async (model, code, cancellation) =>
                    await _promoCodeRepository.IsCodeUniqueAsync(code, model.Id))
                .WithMessage("Mã khuyến mãi đã tồn tại");

            RuleFor(p => p.Description)
                .NotEmpty().WithMessage("Mô tả khuyến mãi không được để trống")
                .MaximumLength(255).WithMessage("Mô tả không được vượt quá 255 ký tự");

            RuleFor(p => p.Type)
                .NotEmpty().WithMessage("Loại khuyến mãi không được để trống")
                .Must(BeValidPromoCodeType).WithMessage("Loại khuyến mãi không hợp lệ");

            RuleFor(p => p.DiscountPercentage)
                .InclusiveBetween(0, 100).WithMessage("Phần trăm giảm giá phải từ 0 đến 100")
                .When(p => p.Type == PromoCodeType.PercentageDiscount.ToString() || p.Type == PromoCodeType.Mixed.ToString());

            RuleFor(p => p.DiscountAmount)
                .GreaterThanOrEqualTo(0).WithMessage("Số tiền giảm giá không được âm")
                .When(p => p.Type == PromoCodeType.FixedAmountDiscount.ToString() || p.Type == PromoCodeType.Mixed.ToString());

            RuleFor(p => p.ValidFrom)
                .NotEmpty().WithMessage("Ngày bắt đầu không được để trống")
                .LessThan(p => p.ValidTo).WithMessage("Ngày bắt đầu phải sớm hơn ngày kết thúc");

            RuleFor(p => p.ValidTo)
                .NotEmpty().WithMessage("Ngày kết thúc không được để trống");

            RuleFor(p => p.UsageLimit)
                .GreaterThanOrEqualTo(0).WithMessage("Giới hạn sử dụng không được âm");
        }

        private bool BeValidPromoCodeType(string type)
        {
            return Enum.TryParse(typeof(PromoCodeType), type, out _);
        }
    }
}


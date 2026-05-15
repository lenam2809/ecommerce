using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.PromoCodes.Dto;
using Ecommerce.Domain.Interfaces;
using AutoMapper;
using MediatR;

namespace Ecommerce.Application.Features.PromoCodes.Commands.ApplyPromoCode
{
    public class ApplyPromoCodeCommandHandler : IRequestHandler<ApplyPromoCodeCommand, Result<PromoCodeApplyResultDto>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public ApplyPromoCodeCommandHandler(
            IUnitOfWork unitOfWork,
            IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<Result<PromoCodeApplyResultDto>> Handle(ApplyPromoCodeCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var now = DateTime.UtcNow;
                var promoCode = await _unitOfWork.PromoCodes.GetByCodeAsync(request.Code);

                var validationError = ValidatePromoCode(promoCode, request.OrderTotal, now);
                if (validationError != null)
                {
                    return Result<PromoCodeApplyResultDto>.BadRequest(validationError);
                }

                var (discountAmount, freeShipping) = CalculateDiscount(promoCode!, request.OrderTotal);

                var result = new PromoCodeApplyResultDto
                {
                    Success = true,
                    Message = "Mã giảm giá hợp lệ",
                    DiscountAmount = discountAmount,
                    FreeShipping = freeShipping,
                    PromoCode = _mapper.Map<PromoCodeDto>(promoCode!)
                };

                return Result<PromoCodeApplyResultDto>.Success(result);
            }
            catch (Exception ex)
            {
                return Result<PromoCodeApplyResultDto>.BadRequest($"Lỗi khi kiểm tra mã giảm giá: {ex.Message}");
            }
        }

        internal static string? ValidatePromoCode(Domain.Entities.PromoCode? promoCode, decimal orderTotal, DateTime now)
        {
            if (promoCode == null)
            {
                return "Mã giảm giá không tồn tại";
            }

            if (!promoCode.IsActive)
            {
                return "Mã giảm giá không hoạt động";
            }

            if (promoCode.ValidFrom > now || promoCode.ValidTo < now)
            {
                return "Mã giảm giá đã hết hạn hoặc chưa đến thời gian sử dụng";
            }

            if (promoCode.UsageLimit > 0 && promoCode.TimesUsed >= promoCode.UsageLimit)
            {
                return "Mã giảm giá đã đạt giới hạn sử dụng";
            }

            if (orderTotal <= 0)
            {
                return "Tổng đơn hàng không hợp lệ";
            }

            return null;
        }

        internal static (decimal DiscountAmount, bool FreeShipping) CalculateDiscount(Domain.Entities.PromoCode promoCode, decimal orderTotal)
        {
            decimal discountAmount = 0;
            var freeShipping = false;

            switch (promoCode.Type)
            {
                case Domain.Entities.PromoCodeType.PercentageDiscount:
                    discountAmount = Math.Round(orderTotal * (promoCode.DiscountPercentage / 100), 2);
                    break;
                case Domain.Entities.PromoCodeType.FixedAmountDiscount:
                    discountAmount = promoCode.DiscountAmount;
                    break;
                case Domain.Entities.PromoCodeType.FreeShipping:
                    freeShipping = true;
                    break;
                case Domain.Entities.PromoCodeType.Mixed:
                    var percentageDiscount = Math.Round(orderTotal * (promoCode.DiscountPercentage / 100), 2);
                    var fixedDiscount = promoCode.DiscountAmount;
                    discountAmount = Math.Max(percentageDiscount, fixedDiscount);
                    freeShipping = promoCode.FreeShipping;
                    break;
            }

            if (discountAmount > orderTotal)
            {
                discountAmount = orderTotal;
            }

            return (discountAmount, freeShipping);
        }
    }
}


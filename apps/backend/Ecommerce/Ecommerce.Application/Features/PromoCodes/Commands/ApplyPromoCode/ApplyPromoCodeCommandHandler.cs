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
                // Kiểm tra mã giảm giá có hợp lệ không
                var promoCode = await _unitOfWork.PromoCodes.GetByCodeAsync(request.Code);

                if (promoCode == null)
                {
                    return Result<PromoCodeApplyResultDto>.BadRequest("Mã giảm giá không tồn tại");
                }

                if (!promoCode.IsActive)
                {
                    return Result<PromoCodeApplyResultDto>.BadRequest("Mã giảm giá không còn hiệu lực");
                }

                if (promoCode.ValidFrom > DateTime.Now)
                {
                    return Result<PromoCodeApplyResultDto>.BadRequest("Mã giảm giá chưa đến thời hạn sử dụng");
                }

                if (promoCode.ValidTo < DateTime.Now)
                {
                    return Result<PromoCodeApplyResultDto>.BadRequest("Mã giảm giá đã hết hạn");
                }

                if (promoCode.UsageLimit > 0 && promoCode.TimesUsed >= promoCode.UsageLimit)
                {
                    return Result<PromoCodeApplyResultDto>.BadRequest("Mã giảm giá đã đạt giới hạn sử dụng");
                }

                // Tính toán số tiền giảm giá
                decimal discountAmount = 0;
                bool freeShipping = false;

                switch (promoCode.Type)
                {
                    case Domain.Entities.PromoCodeType.PercentageDiscount:
                        discountAmount = Math.Round(request.OrderTotal * (promoCode.DiscountPercentage / 100), 2);
                        break;
                    case Domain.Entities.PromoCodeType.FixedAmountDiscount:
                        discountAmount = promoCode.DiscountAmount;
                        // Đảm bảo giảm giá không lớn hơn tổng đơn hàng
                        if (discountAmount > request.OrderTotal)
                        {
                            discountAmount = request.OrderTotal;
                        }
                        break;
                    case Domain.Entities.PromoCodeType.FreeShipping:
                        freeShipping = true;
                        break;
                    case Domain.Entities.PromoCodeType.Mixed:
                        // Tính giảm giá theo phần trăm hoặc số cố định, tùy vào giá trị nào lớn hơn
                        decimal percentageDiscount = Math.Round(request.OrderTotal * (promoCode.DiscountPercentage / 100), 2);
                        decimal fixedDiscount = promoCode.DiscountAmount;
                        discountAmount = Math.Max(percentageDiscount, fixedDiscount);

                        // Đảm bảo giảm giá không lớn hơn tổng đơn hàng
                        if (discountAmount > request.OrderTotal)
                        {
                            discountAmount = request.OrderTotal;
                        }

                        freeShipping = promoCode.FreeShipping;
                        break;
                }

                // Tạo kết quả trả về
                var result = new PromoCodeApplyResultDto
                {
                    Success = true,
                    Message = "Áp dụng mã giảm giá thành công",
                    DiscountAmount = discountAmount,
                    FreeShipping = freeShipping,
                    PromoCode = _mapper.Map<PromoCodeDto>(promoCode)
                };

                return Result<PromoCodeApplyResultDto>.Success(result);
            }
            catch (Exception ex)
            {
                return Result<PromoCodeApplyResultDto>.BadRequest($"Lỗi khi áp dụng mã giảm giá: {ex.Message}");
            }
        }
    }
}


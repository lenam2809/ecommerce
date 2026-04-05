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
            var startedLocalTransaction = false;
            try
            {
                if (!_unitOfWork.HasActiveTransaction)
                {
                    await _unitOfWork.BeginTransactionAsync(cancellationToken);
                    startedLocalTransaction = true;
                }

                var now = DateTime.UtcNow;

                // Ensure promo usage limit is incremented atomically in DB
                var rowsAffected = await _unitOfWork
                    .BaseRepository<Domain.Entities.PromoCode>()
                    .ExecuteCommandAsync(
                        "UPDATE \"PromoCodes\" " +
                        "SET \"TimesUsed\" = \"TimesUsed\" + 1 " +
                        "WHERE \"Code\" = {0} " +
                        "AND \"IsActive\" = TRUE " +
                        "AND \"ValidFrom\" <= {1} " +
                        "AND \"ValidTo\" >= {1} " +
                        "AND (\"UsageLimit\" = 0 OR \"TimesUsed\" < \"UsageLimit\")",
                        [request.Code, now],
                        cancellationToken);

                if (rowsAffected == 0)
                {
                    if (startedLocalTransaction)
                    {
                        await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                    }

                    return Result<PromoCodeApplyResultDto>.BadRequest("Mã giảm giá không hợp lệ hoặc đã đạt giới hạn sử dụng");
                }

                // Read back current state after successful atomic increment
                var promoCode = await _unitOfWork.PromoCodes.GetByCodeAsync(request.Code);

                if (promoCode == null)
                {
                    if (startedLocalTransaction)
                    {
                        await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                    }
                    throw new InvalidOperationException("Promo code state changed during transaction");
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

                if (startedLocalTransaction)
                {
                    await _unitOfWork.CommitTransactionAsync(cancellationToken);
                }

                return Result<PromoCodeApplyResultDto>.Success(result);
            }
            catch (Exception ex)
            {
                if (startedLocalTransaction)
                {
                    await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                    return Result<PromoCodeApplyResultDto>.BadRequest($"Lỗi khi áp dụng mã giảm giá: {ex.Message}");
                }

                throw;
            }
        }
    }
}


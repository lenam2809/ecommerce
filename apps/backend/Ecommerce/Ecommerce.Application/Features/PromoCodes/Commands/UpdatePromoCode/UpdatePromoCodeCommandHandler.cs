using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Policies;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Domain.Interfaces.Logging;
using MediatR;
using Microsoft.AspNetCore.Authorization;

namespace Ecommerce.Application.Features.PromoCodes.Commands.UpdatePromoCode
{
    [Authorize(Policy = AuthorizationPolicyNames.Staff.EditPromoCode)]
    public class UpdatePromoCodeCommandHandler : IRequestHandler<UpdatePromoCodeCommand, Result<bool>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IEnhancedLogger _logger;

        public UpdatePromoCodeCommandHandler(
            IUnitOfWork unitOfWork,
            IEnhancedLogger logger)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        public async Task<Result<bool>> Handle(UpdatePromoCodeCommand request, CancellationToken cancellationToken)
        {
            try
            {
                // Lấy mã khuyến mãi từ database
                var promoCode = await _unitOfWork.PromoCodes.GetByIdAsync(request.Id, cancellationToken);
                if (promoCode == null)
                {
                    return Result<bool>.NotFound("Không tìm thấy mã khuyến mãi");
                }

                // Kiểm tra nếu mã đã thay đổi, phải đảm bảo mã mới chưa tồn tại
                if (promoCode.Code != request.Code)
                {
                    if (!await _unitOfWork.PromoCodes.IsCodeUniqueAsync(request.Code, request.Id))
                    {
                        return Result<bool>.BadRequest("Mã khuyến mãi đã tồn tại");
                    }
                }

                // Cập nhật thông tin
                promoCode.Code = request.Code;
                promoCode.Description = request.Description;
                promoCode.Type = Enum.Parse<PromoCodeType>(request.Type);
                promoCode.DiscountPercentage = request.DiscountPercentage;
                promoCode.DiscountAmount = request.DiscountAmount;
                promoCode.FreeShipping = request.FreeShipping;
                promoCode.ValidFrom = request.ValidFrom;
                promoCode.ValidTo = request.ValidTo;
                promoCode.UsageLimit = request.UsageLimit;
                promoCode.IsActive = request.IsActive;

                // Cập nhật vào database
                _unitOfWork.PromoCodes.Update(promoCode);
                await _unitOfWork.CompleteAsync(cancellationToken);

                await _logger.LogAsync(Domain.Enums.ELogLevel.Information,
                    $"Mã khuyến mãi đã được cập nhật: {promoCode.Code}",
                    "Cập nhật mã khuyến mãi");

                return Result<bool>.Success(true);
            }
            catch (Exception ex)
            {
                await _logger.LogExceptionAsync(ex, "Lỗi khi cập nhật mã khuyến mãi");
                return Result<bool>.BadRequest($"Lỗi khi cập nhật mã khuyến mãi: {ex.Message}");
            }
        }
    }
}


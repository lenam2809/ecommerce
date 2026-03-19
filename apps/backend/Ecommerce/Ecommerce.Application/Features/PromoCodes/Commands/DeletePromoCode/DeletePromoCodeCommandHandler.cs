using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Domain.Interfaces.Logging;
using MediatR;
using Microsoft.AspNetCore.Authorization;

namespace Ecommerce.Application.Features.PromoCodes.Commands.DeletePromoCode
{
    [Authorize(Policy = "Staff:DeletePromoCode")]
    public class DeletePromoCodeCommandHandler : IRequestHandler<DeletePromoCodeCommand, Result<bool>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IEnhancedLogger _logger;

        public DeletePromoCodeCommandHandler(
            IUnitOfWork unitOfWork,
            IEnhancedLogger logger)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        public async Task<Result<bool>> Handle(DeletePromoCodeCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var promoCode = await _unitOfWork.PromoCodes.GetByIdAsync(request.Id, cancellationToken);
                if (promoCode == null)
                {
                    return Result<bool>.NotFound("Không tìm thấy mã khuyến mãi");
                }

                // Xóa mềm bằng cách đánh dấu không hoạt động thay vì xóa khỏi DB
                // Để giữ lịch sử sử dụng
                promoCode.IsActive = false;
                _unitOfWork.PromoCodes.Update(promoCode);

                // Nếu muốn xóa hoàn toàn, sử dụng đoạn mã sau:
                // _unitOfWork.PromoCodes.Remove(promoCode);

                await _unitOfWork.CompleteAsync(cancellationToken);

                await _logger.LogAsync(Domain.Enums.ELogLevel.Information,
                    $"Mã khuyến mãi đã bị xóa: {promoCode.Code}",
                    "Xóa mã khuyến mãi");

                return Result<bool>.Success(true);
            }
            catch (Exception ex)
            {
                await _logger.LogExceptionAsync(ex, "Lỗi khi xóa mã khuyến mãi");
                return Result<bool>.BadRequest($"Lỗi khi xóa mã khuyến mãi: {ex.Message}");
            }
        }
    }
}


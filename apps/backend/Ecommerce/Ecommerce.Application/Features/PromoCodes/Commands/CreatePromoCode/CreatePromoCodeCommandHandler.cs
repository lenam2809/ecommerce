using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Policies;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Domain.Interfaces.Logging;
using AutoMapper;
using MediatR;
using Microsoft.AspNetCore.Authorization;

namespace Ecommerce.Application.Features.PromoCodes.Commands.CreatePromoCode
{
    [Authorize(Policy = AuthorizationPolicyNames.Staff.CreatePromoCode)]
    public class CreatePromoCodeCommandHandler : IRequestHandler<CreatePromoCodeCommand, Result<Guid>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IEnhancedLogger _logger;
        private readonly IMapper _mapper;

        public CreatePromoCodeCommandHandler(
            IUnitOfWork unitOfWork,
            IEnhancedLogger logger,
            IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
            _mapper = mapper;
        }

        public async Task<Result<Guid>> Handle(CreatePromoCodeCommand request, CancellationToken cancellationToken)
        {
            try
            {
                // Kiểm tra mã khuyến mãi đã tồn tại chưa
                if (!await _unitOfWork.PromoCodes.IsCodeUniqueAsync(request.Code))
                {
                    return Result<Guid>.BadRequest("Mã khuyến mãi đã tồn tại");
                }

                // Map từ Command sang Entity
                var promoCode = _mapper.Map<PromoCode>(request);
                promoCode.TimesUsed = 0;

                // Lưu vào database
                var result = await _unitOfWork.PromoCodes.AddAsync(promoCode, cancellationToken);
                await _unitOfWork.CompleteAsync(cancellationToken);

                await _logger.LogAsync(Domain.Enums.ELogLevel.Information,
                    $"Mã khuyến mãi đã được tạo thành công: {result.Code}",
                    "Thêm mới mã khuyến mãi");

                return Result<Guid>.Success(result.Id);
            }
            catch (Exception ex)
            {
                await _logger.LogExceptionAsync(ex, "Lỗi khi tạo mã khuyến mãi");
                return Result<Guid>.BadRequest($"Lỗi khi tạo mã khuyến mãi: {ex.Message}");
            }
        }
    }
}


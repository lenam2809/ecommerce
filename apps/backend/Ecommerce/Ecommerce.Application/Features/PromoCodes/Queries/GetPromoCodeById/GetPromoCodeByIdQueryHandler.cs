using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.PromoCodes.Dto;
using Ecommerce.Domain.Interfaces;
using AutoMapper;
using MediatR;

namespace Ecommerce.Application.Features.PromoCodes.Queries.GetPromoCodeById
{
    public class GetPromoCodeByIdQueryHandler : IRequestHandler<GetPromoCodeByIdQuery, Result<PromoCodeDto>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public GetPromoCodeByIdQueryHandler(
            IUnitOfWork unitOfWork,
            IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<Result<PromoCodeDto>> Handle(GetPromoCodeByIdQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var promoCode = await _unitOfWork.PromoCodes.GetByIdAsync(request.Id, cancellationToken);

                if (promoCode == null)
                {
                    return Result<PromoCodeDto>.NotFound("Không tìm thấy mã khuyến mãi");
                }

                var promoCodeDto = _mapper.Map<PromoCodeDto>(promoCode);
                return Result<PromoCodeDto>.Success(promoCodeDto);
            }
            catch (Exception ex)
            {
                return Result<PromoCodeDto>.BadRequest(ex.Message);
            }
        }
    }
}


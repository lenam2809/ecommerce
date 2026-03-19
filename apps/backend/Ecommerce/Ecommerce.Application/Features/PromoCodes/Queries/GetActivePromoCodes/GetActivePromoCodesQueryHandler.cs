using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.PromoCodes.Dto;
using Ecommerce.Domain.Interfaces;
using AutoMapper;
using MediatR;

namespace Ecommerce.Application.Features.PromoCodes.Queries.GetActivePromoCodes
{
    public class GetActivePromoCodesQueryHandler : IRequestHandler<GetActivePromoCodesQuery, Result<List<PromoCodeSummaryDto>>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public GetActivePromoCodesQueryHandler(
            IUnitOfWork unitOfWork,
            IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<Result<List<PromoCodeSummaryDto>>> Handle(GetActivePromoCodesQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var activeCodes = await _unitOfWork.PromoCodes.GetActivePromoCodesAsync();
                var activeCodeDtos = _mapper.Map<List<PromoCodeSummaryDto>>(activeCodes);

                return Result<List<PromoCodeSummaryDto>>.Success(activeCodeDtos);
            }
            catch (Exception ex)
            {
                return Result<List<PromoCodeSummaryDto>>.BadRequest(ex.Message);
            }
        }
    }
}


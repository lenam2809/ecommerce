using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.PromoCodes.Dto;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces;
using AutoMapper;
using MediatR;
using System.Linq.Expressions;

namespace Ecommerce.Application.Features.PromoCodes.Queries.GetPagedPromoCodes
{
    public class GetPagedPromoCodesQueryHandler : IRequestHandler<GetPagedPromoCodesQuery, Result<PaginatedList<PromoCodeSummaryDto>>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public GetPagedPromoCodesQueryHandler(
            IUnitOfWork unitOfWork,
            IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<Result<PaginatedList<PromoCodeSummaryDto>>> Handle(GetPagedPromoCodesQuery request, CancellationToken cancellationToken)
        {
            try
            {
                // Xây dựng filter từ các tham số
                Expression<Func<PromoCode, bool>> filter = promoCode =>
                    (string.IsNullOrEmpty(request.SearchTerm) ||
                     promoCode.Code.Contains(request.SearchTerm) ||
                     promoCode.Description.Contains(request.SearchTerm)) &&
                    (!request.IsActive.HasValue || promoCode.IsActive == request.IsActive.Value);

                // Xây dựng order by
                Func<IQueryable<PromoCode>, IOrderedQueryable<PromoCode>> orderBy = query =>
                {
                    return request.SortBy.ToLower() switch
                    {
                        "code" => request.IsDescending
                            ? query.OrderByDescending(p => p.Code)
                            : query.OrderBy(p => p.Code),
                        "validto" => request.IsDescending
                            ? query.OrderByDescending(p => p.ValidTo)
                            : query.OrderBy(p => p.ValidTo),
                        "timesused" => request.IsDescending
                            ? query.OrderByDescending(p => p.TimesUsed)
                            : query.OrderBy(p => p.TimesUsed),
                        _ => request.IsDescending
                            ? query.OrderByDescending(p => p.CreatedAt)
                            : query.OrderBy(p => p.CreatedAt)
                    };
                };

                // Lấy dữ liệu phân trang
                var paginatedResult = await _unitOfWork.PromoCodes.GetPaginatedAsync(
                    filter: filter,
                    orderBy: orderBy,
                    pageIndex: request.PageNumber,
                    pageSize: request.PageSize,
                    cancellationToken: cancellationToken
                );

                // Map sang DTO
                var promoCodeDtos = _mapper.Map<List<PromoCodeSummaryDto>>(paginatedResult.Items);

                // Tạo kết quả trả về
                var result = new PaginatedList<PromoCodeSummaryDto>(
                    promoCodeDtos,
                    paginatedResult.TotalCount,
                    paginatedResult.PageIndex,
                    paginatedResult.PageSize);

                return Result<PaginatedList<PromoCodeSummaryDto>>.Success(result);
            }
            catch (Exception ex)
            {
                return Result<PaginatedList<PromoCodeSummaryDto>>.BadRequest(ex.Message);
            }
        }
    }
}


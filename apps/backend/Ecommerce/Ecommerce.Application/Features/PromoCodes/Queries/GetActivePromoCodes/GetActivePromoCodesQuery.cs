using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.PromoCodes.Dto;
using MediatR;

namespace Ecommerce.Application.Features.PromoCodes.Queries.GetActivePromoCodes
{
    public class GetActivePromoCodesQuery : IRequest<Result<List<PromoCodeSummaryDto>>>
    {
    }
}


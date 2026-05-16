using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.PromoCodes.Dto;
using MediatR;

using Ecommerce.Application.Common.Interfaces;

namespace Ecommerce.Application.Features.PromoCodes.Queries.GetActivePromoCodes
{
    public class GetActivePromoCodesQuery : IQuery<Result<List<PromoCodeSummaryDto>>>
    {
    }
}


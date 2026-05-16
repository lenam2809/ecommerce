using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.PromoCodes.Dto;
using MediatR;

using Ecommerce.Application.Common.Interfaces;

namespace Ecommerce.Application.Features.PromoCodes.Queries.GetPromoCodeById
{
    public class GetPromoCodeByIdQuery : IQuery<Result<PromoCodeDto>>
    {
        public Guid Id { get; set; }
    }
}


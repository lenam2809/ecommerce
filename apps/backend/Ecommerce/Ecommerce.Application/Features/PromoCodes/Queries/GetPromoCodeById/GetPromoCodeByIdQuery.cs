using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.PromoCodes.Dto;
using MediatR;

namespace Ecommerce.Application.Features.PromoCodes.Queries.GetPromoCodeById
{
    public class GetPromoCodeByIdQuery : IRequest<Result<PromoCodeDto>>
    {
        public Guid Id { get; set; }
    }
}


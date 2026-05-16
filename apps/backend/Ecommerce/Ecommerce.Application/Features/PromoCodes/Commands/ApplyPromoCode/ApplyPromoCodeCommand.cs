using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.PromoCodes.Dto;
using MediatR;

using Ecommerce.Application.Common.Interfaces;

namespace Ecommerce.Application.Features.PromoCodes.Commands.ApplyPromoCode
{
    public class ApplyPromoCodeCommand : IQuery<Result<PromoCodeApplyResultDto>>
    {
        public required string Code { get; set; }
        public decimal OrderTotal { get; set; }
    }
}


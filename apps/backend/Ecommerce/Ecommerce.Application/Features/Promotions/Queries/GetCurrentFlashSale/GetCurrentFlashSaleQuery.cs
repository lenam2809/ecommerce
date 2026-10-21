using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Promotions.Dto;
using MediatR;

namespace Ecommerce.Application.Features.Promotions.Queries.GetCurrentFlashSale
{
    public class GetCurrentFlashSaleQuery : IRequest<Result<FlashSaleDto>>
    {
    }
}

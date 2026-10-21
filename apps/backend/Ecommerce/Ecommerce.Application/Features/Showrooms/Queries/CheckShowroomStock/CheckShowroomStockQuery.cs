using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Showrooms.Dto;
using MediatR;

namespace Ecommerce.Application.Features.Showrooms.Queries.CheckShowroomStock
{
    public class CheckShowroomStockQuery : IRequest<Result<List<ShowroomStockDto>>>
    {
        public Guid ProductId { get; set; }
        public Guid? ProductVariantSkuId { get; set; }
    }
}

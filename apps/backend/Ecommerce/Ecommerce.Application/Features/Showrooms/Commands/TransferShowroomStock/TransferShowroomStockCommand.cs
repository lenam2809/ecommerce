using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using MediatR;

namespace Ecommerce.Application.Features.Showrooms.Commands.TransferShowroomStock
{
    public class TransferShowroomStockCommand : IRequest<Result<bool>>, INonTransactionalRequest
    {
        public Guid FromShowroomId { get; set; }
        public Guid ToShowroomId { get; set; }
        public Guid ProductId { get; set; }
        public Guid? ProductVariantSkuId { get; set; }
        public int Quantity { get; set; }
        public string? Note { get; set; }
    }
}

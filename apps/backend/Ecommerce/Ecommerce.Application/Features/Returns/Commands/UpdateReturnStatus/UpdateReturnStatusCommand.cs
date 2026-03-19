using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Enums;
using MediatR;

namespace Ecommerce.Application.Features.Returns.Commands.UpdateReturnStatus
{
    /// <summary>
    /// Chuyển trạng thái RMA theo workflow: 
    /// Approved → ItemReceived → QualityCheck → RefundProcessing/ExchangeProcessing → Completed
    /// </summary>
    public class UpdateReturnStatusCommand : IRequest<Result<bool>>
    {
        public Guid ReturnRequestId { get; set; }
        public EReturnStatus NewStatus { get; set; }
        public string? Note { get; set; }
    }
}

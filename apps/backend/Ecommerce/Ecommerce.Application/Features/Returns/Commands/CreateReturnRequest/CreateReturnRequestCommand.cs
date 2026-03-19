using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Enums;
using MediatR;

namespace Ecommerce.Application.Features.Returns.Commands.CreateReturnRequest
{
    public class CreateReturnRequestCommand : IRequest<Result<Guid>>
    {
        public Guid OrderId { get; set; }
        public Guid OrderItemId { get; set; }
        public Guid CustomerId { get; set; }
        public EReturnType Type { get; set; }
        public EReturnReason Reason { get; set; }
        public string CustomerNote { get; set; } = string.Empty;
        public int Quantity { get; set; }

        /// <summary>
        /// URLs of uploaded evidence files (ảnh/video)
        /// </summary>
        public List<EvidenceFileInput> EvidenceFiles { get; set; } = [];
    }

    public class EvidenceFileInput
    {
        public string FileUrl { get; set; } = string.Empty;
        public EEvidenceType FileType { get; set; }
        public string? Description { get; set; }
    }
}

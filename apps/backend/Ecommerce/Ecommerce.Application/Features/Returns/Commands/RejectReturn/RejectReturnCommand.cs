using Ecommerce.Application.Common.Models;
using MediatR;

namespace Ecommerce.Application.Features.Returns.Commands.RejectReturn
{
    public class RejectReturnCommand : IRequest<Result<bool>>
    {
        public Guid ReturnRequestId { get; set; }
        public Guid StaffId { get; set; }
        public string RejectionReason { get; set; } = string.Empty;
    }
}

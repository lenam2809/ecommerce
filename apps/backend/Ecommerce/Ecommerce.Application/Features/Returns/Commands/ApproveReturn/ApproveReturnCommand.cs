using Ecommerce.Application.Common.Models;
using MediatR;

namespace Ecommerce.Application.Features.Returns.Commands.ApproveReturn
{
    public class ApproveReturnCommand : IRequest<Result<bool>>
    {
        public Guid ReturnRequestId { get; set; }
        public Guid StaffId { get; set; }
        public string? StaffNote { get; set; }
        public decimal FinalRefundAmount { get; set; }
    }
}

using Ecommerce.Application.Common.Models;
using MediatR;

using Ecommerce.Application.Common.Interfaces;

namespace Ecommerce.Application.Features.Returns.Commands.ApproveReturn
{
    public class ApproveReturnCommand : ICommand<Result<bool>>
    {
        public Guid ReturnRequestId { get; set; }
        public Guid StaffId { get; set; }
        public string? StaffNote { get; set; }
        public decimal FinalRefundAmount { get; set; }
    }
}

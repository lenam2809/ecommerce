using Ecommerce.Application.Common.Models;
using MediatR;

using Ecommerce.Application.Common.Interfaces;

namespace Ecommerce.Application.Features.Returns.Commands.RejectReturn
{
    public class RejectReturnCommand : ICommand<Result<bool>>
    {
        public Guid ReturnRequestId { get; set; }
        public Guid StaffId { get; set; }
        public string RejectionReason { get; set; } = string.Empty;
    }
}

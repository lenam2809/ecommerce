using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Returns.Dto;
using Ecommerce.Domain.Enums;
using MediatR;

namespace Ecommerce.Application.Features.Returns.Queries.GetReturnRequests
{
    public class GetReturnRequestsQuery : IRequest<Result<List<ReturnRequestListDto>>>
    {
        public Guid? CustomerId { get; set; }
        public Guid? OrderId { get; set; }
        public EReturnStatus? Status { get; set; }
    }
}

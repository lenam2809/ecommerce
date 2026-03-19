using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Reports.Dto;
using MediatR;

namespace Ecommerce.Application.Features.Reports.Queries.GetOrderStatus
{
    public class GetOrderStatusQuery : IRequest<Result<List<OrderStatusDto>>>
    {
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }
}


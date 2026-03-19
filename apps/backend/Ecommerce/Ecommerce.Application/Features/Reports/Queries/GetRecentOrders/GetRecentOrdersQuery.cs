using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Reports.Dto;
using MediatR;

namespace Ecommerce.Application.Features.Reports.Queries.GetRecentOrders
{
    public class GetRecentOrdersQuery : IRequest<Result<List<RecentOrderDto>>>
    {
        public int Limit { get; set; } = 5;
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }
}


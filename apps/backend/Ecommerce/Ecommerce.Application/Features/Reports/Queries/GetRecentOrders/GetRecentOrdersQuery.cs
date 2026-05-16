using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Reports.Dto;
using MediatR;

using Ecommerce.Application.Common.Interfaces;

namespace Ecommerce.Application.Features.Reports.Queries.GetRecentOrders
{
    public class GetRecentOrdersQuery : IQuery<Result<List<RecentOrderDto>>>
    {
        public int Limit { get; set; } = 5;
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }
}


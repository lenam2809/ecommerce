using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Reports.Dto;
using MediatR;

using Ecommerce.Application.Common.Interfaces;

namespace Ecommerce.Application.Features.Reports.Queries.GetTopUsers
{
    public class GetTopUsersQuery : IQuery<Result<List<TopUserDto>>>
    {
        public int TopN { get; set; } = 10;
        public string OrderBy { get; set; } = "TotalSpent"; // "TotalSpent", "OrderCount", "LastActivity"
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }
}


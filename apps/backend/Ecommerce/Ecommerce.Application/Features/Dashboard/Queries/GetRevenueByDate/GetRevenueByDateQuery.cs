using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Dashboard.Dto;
using MediatR;

namespace Ecommerce.Application.Features.Dashboard.Queries.GetRevenueByDate
{
    public class GetRevenueByDateQuery : IRequest<Result<List<RevenueByDateDto>>>
    {
        public int Days { get; set; } = 30;
    }
}


using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Reports.Dto;
using MediatR;

namespace Ecommerce.Application.Features.Reports.Queries.GetAverageOrderValue
{
    public class GetAverageOrderValueQuery : IRequest<Result<List<AverageOrderValueDto>>>
    {
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public int? MonthsCount { get; set; } = 12;
    }
}


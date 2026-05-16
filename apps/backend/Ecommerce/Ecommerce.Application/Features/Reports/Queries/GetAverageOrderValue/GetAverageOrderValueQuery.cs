using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Reports.Dto;
using MediatR;

using Ecommerce.Application.Common.Interfaces;

namespace Ecommerce.Application.Features.Reports.Queries.GetAverageOrderValue
{
    public class GetAverageOrderValueQuery : IQuery<Result<List<AverageOrderValueDto>>>
    {
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public int? MonthsCount { get; set; } = 12;
    }
}


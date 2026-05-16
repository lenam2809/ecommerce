using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Reports.Dto;
using MediatR;

using Ecommerce.Application.Common.Interfaces;

namespace Ecommerce.Application.Features.Reports.Queries.GetUserSegmentation
{
    public class GetUserSegmentationQuery : IQuery<Result<List<UserSegmentationDto>>>
    {
        public bool IncludeInactive { get; set; } = false;
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }
}


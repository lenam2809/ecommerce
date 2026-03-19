using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Reports.Dto;
using MediatR;

namespace Ecommerce.Application.Features.Reports.Queries.GetUserSegmentation
{
    public class GetUserSegmentationQuery : IRequest<Result<List<UserSegmentationDto>>>
    {
        public bool IncludeInactive { get; set; } = false;
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }
}


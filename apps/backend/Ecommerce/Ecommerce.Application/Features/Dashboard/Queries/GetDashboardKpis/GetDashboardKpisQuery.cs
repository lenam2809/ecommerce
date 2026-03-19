using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Dashboard.Dto;
using MediatR;

namespace Ecommerce.Application.Features.Dashboard.Queries.GetDashboardKpis
{
    public class GetDashboardKpisQuery : IRequest<Result<List<DashboardKpiDto>>>
    {
        // This query doesn't require any parameters
    }
}


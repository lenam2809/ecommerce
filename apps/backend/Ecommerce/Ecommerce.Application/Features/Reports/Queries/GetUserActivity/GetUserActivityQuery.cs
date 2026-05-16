using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Reports.Dto;
using MediatR;

using Ecommerce.Application.Common.Interfaces;

namespace Ecommerce.Application.Features.Reports.Queries.GetUserActivity
{
    public class GetUserActivityQuery : IQuery<Result<List<UserActivityDto>>>
    {
        public int Days { get; set; } = 30;
        public string ActivityType { get; set; } = "All"; // "All", "Purchases", "Logins", "PageViews"
    }
}


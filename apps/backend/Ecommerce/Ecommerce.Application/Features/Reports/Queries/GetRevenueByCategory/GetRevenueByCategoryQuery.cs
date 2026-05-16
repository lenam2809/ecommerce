using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Reports.Dto;
using MediatR;

using Ecommerce.Application.Common.Interfaces;

namespace Ecommerce.Application.Features.Reports.Queries.GetRevenueByCategory
{
    public class GetRevenueByCategoryQuery : IQuery<Result<List<RevenueByCategoryDto>>>
    {
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public int? TopN { get; set; } = 10; // Lấy top N danh mục
    }
}


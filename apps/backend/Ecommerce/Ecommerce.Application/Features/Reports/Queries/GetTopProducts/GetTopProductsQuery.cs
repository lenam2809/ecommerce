using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Reports.Dto;
using MediatR;

namespace Ecommerce.Application.Features.Reports.Queries.GetTopProducts
{
    public class GetTopProductsQuery : IRequest<Result<List<TopProductDto>>>
    {
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public int? TopN { get; set; } = 10;
        public Guid? CategoryId { get; set; }
        public string? OrderBy { get; set; } = "Revenue"; // Revenue, Quantity, Orders
    }
}


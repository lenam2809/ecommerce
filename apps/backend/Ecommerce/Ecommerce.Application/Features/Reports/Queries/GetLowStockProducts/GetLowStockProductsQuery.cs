using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Reports.Dto;
using MediatR;

namespace Ecommerce.Application.Features.Reports.Queries.GetLowStockProducts
{
    public class GetLowStockProductsQuery : IRequest<Result<List<LowStockProductDto>>>
    {
        public int? MinStock { get; set; } = 10;
        public Guid? CategoryId { get; set; }
        public string? StockStatus { get; set; } // "Critical", "Low", "All"
    }
}


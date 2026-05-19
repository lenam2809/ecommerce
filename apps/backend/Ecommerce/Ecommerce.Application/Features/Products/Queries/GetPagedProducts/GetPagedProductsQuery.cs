using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Common.Attributes;
using Ecommerce.Application.Common.Constants;
using Ecommerce.Application.Features.Products.Dto;
using MediatR;

namespace Ecommerce.Application.Features.Products.Queries.GetPagedProducts
{
    [Cacheable(CacheKeys.ProductAll)]
    public class GetPagedProductsQuery : IRequest<Result<PaginatedList<ProductDto>>>
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string? SearchTerm { get; set; }
        public string CategoryIds { get; set; } = string.Empty;
        public string BrandIds { get; set; } = string.Empty;
        public int? Rating { get; set; }
        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }
        public string SortBy { get; set; } = "name";
        public bool IsDescending { get; set; } = false;
    }
}


using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Products.Dto;
using MediatR;

namespace Ecommerce.Application.Features.Products.Queries.SearchProducts
{
    /// <summary>
    /// UC-CAT-02: Tìm kiếm sản phẩm sử dụng Elasticsearch.
    /// Hỗ trợ full-text search, fuzzy (sửa lỗi chính tả), lọc đa tiêu chí.
    /// </summary>
    public class SearchProductsQuery : IRequest<Result<PaginatedList<ProductSearchResultDto>>>
    {
        /// <summary>Từ khóa tìm kiếm (search Name + Description với fuzzy)</summary>
        public string? Keyword { get; set; }

        /// <summary>Alias public query parameter: q</summary>
        public string? Query { get; set; }

        /// <summary>Lọc theo danh mục</summary>
        public Guid? CategoryId { get; set; }

        /// <summary>Lọc theo thương hiệu</summary>
        public Guid? BrandId { get; set; }

        /// <summary>Giá tối thiểu</summary>
        public decimal? MinPrice { get; set; }

        /// <summary>Giá tối đa</summary>
        public decimal? MaxPrice { get; set; }

        /// <summary>Trang hiện tại (mặc định 1)</summary>
        public int PageNumber { get; set; } = 1;

        /// <summary>Alias public query parameter: page</summary>
        public int? Page { get; set; }

        /// <summary>Số item mỗi trang (mặc định 12)</summary>
        public int PageSize { get; set; } = 12;

        /// <summary>Trường sắp xếp: price, rating, createdat, name (mặc định)</summary>
        public string? SortBy { get; set; }

        /// <summary>Sắp xếp giảm dần</summary>
        public bool IsDescending { get; set; } = false;
    }
}

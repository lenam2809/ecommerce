using Elastic.Clients.Elasticsearch;

namespace Ecommerce.Infrastructure.Elasticsearch.Documents
{
    /// <summary>
    /// Document flatten từ Product + Category + Brand cho Elasticsearch.
    /// Tối ưu cho truy vấn full-text search, không cần JOIN.
    /// </summary>
    public class ProductDocument
    {
        public Guid Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Sku { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public decimal? SalePrice { get; set; }
        public string Image { get; set; } = string.Empty;
        public string MainImage { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int StockQuantity { get; set; }
        public double Rating { get; set; }
        public int ReviewCount { get; set; }
        public bool IsActive { get; set; }

        // Flatten từ Category
        public Guid CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public string CategorySlug { get; set; } = string.Empty;

        // Flatten từ Brand
        public Guid BrandId { get; set; }
        public string BrandName { get; set; } = string.Empty;
        public string BrandSlug { get; set; } = string.Empty;

        // Cho Completion Suggester (auto-suggestion siêu nhanh)
        public CompletionField? Suggest { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public List<string> Tags { get; set; } = [];
    }

    /// <summary>
    /// Model cho Completion Suggester trong Elasticsearch 8.x.
    /// (Thư viện Elastic.Clients.Elasticsearch 8.x không cung cấp sẵn class này cho POCO).
    /// </summary>
    public class CompletionField
    {
        public IEnumerable<string>? Input { get; set; }
        public int? Weight { get; set; }
    }
}

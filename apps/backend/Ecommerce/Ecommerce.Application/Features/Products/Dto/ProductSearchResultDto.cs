namespace Ecommerce.Application.Features.Products.Dto
{
    /// <summary>
    /// DTO trả về từ Elasticsearch search — đã flatten Category + Brand.
    /// </summary>
    public class ProductSearchResultDto
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

        public Guid CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public string CategorySlug { get; set; } = string.Empty;

        public Guid BrandId { get; set; }
        public string BrandName { get; set; } = string.Empty;
        public string BrandSlug { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; }
        public List<string> Tags { get; set; } = [];
    }
}

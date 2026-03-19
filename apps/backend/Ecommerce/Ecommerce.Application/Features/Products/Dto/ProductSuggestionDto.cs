namespace Ecommerce.Application.Features.Products.Dto
{
    /// <summary>
    /// DTO cho auto-suggestion khi user đang gõ tìm kiếm (UC-CAT-06).
    /// </summary>
    public class ProductSuggestionDto
    {
        public Guid Id { get; set; }
        public string Text { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public string? CategoryName { get; set; }
        public decimal Price { get; set; }
        public string? Image { get; set; }
    }
}

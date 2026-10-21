namespace Ecommerce.Domain.Entities
{
    public class FlashSale : BaseEntity
    {
        public string Code { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string? Subtitle { get; set; }
        public string? BannerImageUrl { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public bool IsActive { get; set; } = true;
        public int Priority { get; set; } = 0;

        // Navigation properties
        public virtual ICollection<FlashSaleItem> Items { get; set; } = new List<FlashSaleItem>();
    }
}

namespace Ecommerce.Domain.Entities
{
    public class MarqueeMessage : BaseEntity
    {
        public string Content { get; set; } = string.Empty;
        public string? LinkUrl { get; set; }
        public string? Icon { get; set; }
        public int Speed { get; set; } = 50;
        public int Priority { get; set; } = 0;
        public bool IsActive { get; set; } = true;
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }
}

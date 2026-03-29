namespace Ecommerce.Application.Features.Marquee.DTOs
{
    public class MarqueeMessageAdminDto
    {
        public Guid Id { get; set; }
        public string Content { get; set; } = string.Empty;
        public string? LinkUrl { get; set; }
        public string? Icon { get; set; }
        public int Speed { get; set; }
        public int Priority { get; set; }
        public bool IsActive { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}

namespace Ecommerce.Application.Features.Marquee.DTOs
{
    public class MarqueeMessagePublicDto
    {
        public Guid Id { get; set; }
        public string Content { get; set; } = string.Empty;
        public string? LinkUrl { get; set; }
        public string? Icon { get; set; }
        public int Speed { get; set; }
    }
}

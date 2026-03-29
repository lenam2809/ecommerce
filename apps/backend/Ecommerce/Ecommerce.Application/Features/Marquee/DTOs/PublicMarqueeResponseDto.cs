namespace Ecommerce.Application.Features.Marquee.DTOs
{
    public class PublicMarqueeResponseDto
    {
        public bool IsEnabled { get; set; }
        public List<MarqueeMessagePublicDto> Messages { get; set; } = new();
    }
}

namespace Ecommerce.Application.Features.Marquee.DTOs
{
    public class AdminMarqueeResponseDto
    {
        public bool IsEnabled { get; set; }
        public List<MarqueeMessageAdminDto> Messages { get; set; } = new();
    }
}

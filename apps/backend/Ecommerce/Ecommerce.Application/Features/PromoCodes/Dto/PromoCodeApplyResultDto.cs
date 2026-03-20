namespace Ecommerce.Application.Features.PromoCodes.Dto
{
    public class PromoCodeApplyResultDto
    {
        public bool Success { get; set; }
        public required string Message { get; set; }
        public decimal DiscountAmount { get; set; }
        public bool FreeShipping { get; set; }
        public required PromoCodeDto PromoCode { get; set; }
    }
}


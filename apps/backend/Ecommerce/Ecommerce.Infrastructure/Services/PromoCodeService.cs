using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces.Base;

namespace Ecommerce.Infrastructure.Services
{
    public class PromoCodeService
    {
        private readonly IRepository<PromoCode> _promoCodeRepository;

        public PromoCodeService(IRepository<PromoCode> promoCodeRepository)
        {
            _promoCodeRepository = promoCodeRepository;
        }

        public async Task<PromoCodeValidationResult> ValidatePromoCode(string code, decimal cartSubtotal)
        {
            var promoCode = await _promoCodeRepository.FirstOrDefaultAsync(pc => pc.Code == code && pc.IsActive);

            if (promoCode == null)
                return new PromoCodeValidationResult { IsValid = false, ErrorMessage = "Invalid promo code", PromoCode = null! };

            if (DateTime.Now < promoCode.ValidFrom || DateTime.Now > promoCode.ValidTo)
                return new PromoCodeValidationResult { IsValid = false, ErrorMessage = "Promo code expired", PromoCode = promoCode };

            if (promoCode.UsageLimit > 0 && promoCode.TimesUsed >= promoCode.UsageLimit)
                return new PromoCodeValidationResult { IsValid = false, ErrorMessage = "Promo code usage limit reached", PromoCode = promoCode };

            return new PromoCodeValidationResult
            {
                IsValid = true,
                PromoCode = promoCode,
                ErrorMessage = string.Empty,
                DiscountAmount = CalculateDiscount(promoCode, cartSubtotal),
                FreeShipping = promoCode.FreeShipping
            };
        }

        private decimal CalculateDiscount(PromoCode promoCode, decimal cartSubtotal)
        {
            if (promoCode.Type == PromoCodeType.PercentageDiscount)
                return cartSubtotal * (promoCode.DiscountPercentage / 100m);

            if (promoCode.Type == PromoCodeType.FixedAmountDiscount)
                return Math.Min(promoCode.DiscountAmount, cartSubtotal);

            return 0;
        }
    }

    public class PromoCodeValidationResult
    {
        public bool IsValid { get; set; }
        public required string ErrorMessage { get; set; }
        public required PromoCode PromoCode { get; set; }
        public decimal DiscountAmount { get; set; }
        public bool FreeShipping { get; set; }
    }
}


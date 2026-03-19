using Ecommerce.Domain.Services;

namespace Ecommerce.Application.Services
{
    /// <summary>
    /// Implementation of shipping cost calculation based on business requirements
    /// </summary>
    public class ShippingCalculator : IShippingCalculator
    {
        // Business rules theo business_requirements.md
        private const decimal FREE_SHIPPING_THRESHOLD = 500_000m; // VND
        private const decimal FIXED_SHIPPING_COST = 30_000m;      // VND

        public decimal CalculateShippingCost(decimal subtotal, string? promoCode = null)
        {
            if (IsFreeShipping(subtotal, promoCode))
                return 0;

            // Empty cart has no shipping cost
            if (subtotal == 0)
                return 0;

            return FIXED_SHIPPING_COST;
        }

        public bool IsFreeShipping(decimal subtotal, string? promoCode = null)
        {
            // Free shipping for FREESHIP promo code
            if (!string.IsNullOrEmpty(promoCode) &&
                promoCode.Equals("FREESHIP", StringComparison.OrdinalIgnoreCase))
                return true;

            // Free shipping if order value > 500,000 VND
            return subtotal > FREE_SHIPPING_THRESHOLD;
        }
    }
}

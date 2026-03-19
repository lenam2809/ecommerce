namespace Ecommerce.Domain.Services
{
    /// <summary>
    /// Service interface for calculating shipping costs based on business rules
    /// </summary>
    public interface IShippingCalculator
    {
        /// <summary>
        /// Calculate shipping cost for a given subtotal and optional promo code
        /// </summary>
        /// <param name="subtotal">Cart subtotal amount in VND</param>
        /// <param name="promoCode">Optional promo code (e.g., "FREESHIP")</param>
        /// <returns>Shipping cost in VND</returns>
        decimal CalculateShippingCost(decimal subtotal, string? promoCode = null);

        /// <summary>
        /// Check if shipping is free for given subtotal and promo code
        /// </summary>
        bool IsFreeShipping(decimal subtotal, string? promoCode = null);
    }
}

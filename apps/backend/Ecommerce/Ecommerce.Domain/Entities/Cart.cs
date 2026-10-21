using System.ComponentModel.DataAnnotations.Schema;

namespace Ecommerce.Domain.Entities
{
    public class Cart : BaseEntity
    {
        public decimal Subtotal { get; private set; }
        public decimal ShippingCost { get; private set; }
        public decimal Discount { get; private set; }
        public decimal Total { get; private set; }
        public string? PromoCode { get; private set; }

        [ForeignKey(nameof(ApplicationUser))]
        public Guid? ApplicationUserId { get; private set; }
        public virtual ApplicationUser? ApplicationUser { get; private set; }

        public string? AnonymousId { get; private set; }

        private readonly List<CartItem> _cartItems = new();
        public virtual IReadOnlyCollection<CartItem> CartItems => _cartItems.AsReadOnly();

        // For EF Core
        public Cart() { }

        // Constructor for authenticated user cart
        public Cart(Guid userId)
        {
            ApplicationUserId = userId;
            AnonymousId = null;
            PromoCode = string.Empty;
        }

        // Constructor for guest cart
        public Cart(string anonymousId)
        {
            ApplicationUserId = null;
            AnonymousId = anonymousId;
            PromoCode = string.Empty;
        }

        public void AddItem(
            Product product,
            int quantity,
            string? color = null,
            string? size = null,
            Guid? addOnId = null,
            decimal addOnPrice = 0,
            Guid? productVariantSkuId = null)
        {
            var normColor = color?.Trim() ?? string.Empty;
            var normSize = size?.Trim() ?? string.Empty;

            var existingItem = _cartItems.FirstOrDefault(i =>
                i.ProductId == product.Id &&
                i.Color == normColor &&
                i.Size == normSize &&
                i.AddOnId == addOnId &&
                i.ProductVariantSkuId == productVariantSkuId);

            if (existingItem != null)
            {
                existingItem.AddQuantity(quantity);
            }
            else
            {
                var newItem = new CartItem(this.Id, product, quantity, normColor, normSize, productVariantSkuId);
                newItem.AddOnId = addOnId;
                newItem.AddOnPrice = addOnPrice;
                _cartItems.Add(newItem);
            }

            RecalculateTotal();
        }

        public void UpdateQuantity(Guid itemIdOrProductId, int quantity, string? color = null, string? size = null)
        {
            CartItem? item;
            if (color != null || size != null)
            {
                var normColor = color?.Trim() ?? string.Empty;
                var normSize = size?.Trim() ?? string.Empty;
                item = _cartItems.FirstOrDefault(i => i.ProductId == itemIdOrProductId
                    && i.Color == normColor
                    && i.Size == normSize);
            }
            else
            {
                item = _cartItems.FirstOrDefault(i => i.Id == itemIdOrProductId)
                    ?? _cartItems.FirstOrDefault(i => i.ProductId == itemIdOrProductId);
            }

            if (item == null)
            {
                throw new Exception($"Không tìm thấy sản phẩm trong giỏ hàng. Id: {itemIdOrProductId}, Items count: {_cartItems.Count}");
            }

            if (quantity <= 0)
            {
                _cartItems.Remove(item);
            }
            else
            {
                item.UpdateQuantity(quantity);
            }
            RecalculateTotal();
        }

        public void RemoveItem(Guid itemIdOrProductId, string? color = null, string? size = null)
        {
            CartItem? item;
            if (color != null || size != null)
            {
                var normColor = color?.Trim() ?? string.Empty;
                var normSize = size?.Trim() ?? string.Empty;
                item = _cartItems.FirstOrDefault(i => i.ProductId == itemIdOrProductId
                    && i.Color == normColor
                    && i.Size == normSize);
            }
            else
            {
                item = _cartItems.FirstOrDefault(i => i.Id == itemIdOrProductId)
                    ?? _cartItems.FirstOrDefault(i => i.ProductId == itemIdOrProductId);
            }

            if (item != null)
            {
                _cartItems.Remove(item);
                RecalculateTotal();
            }
        }

        public void Clear()
        {
            _cartItems.Clear();
            RecalculateTotal();
        }

        private void RecalculateTotal()
        {
            Subtotal = _cartItems.Sum(i => i.TotalPrice);
            // Note: ShippingCost should be calculated externally using IShippingCalculator
            // and set via SetShippingCost() method
            Total = Subtotal + ShippingCost - Discount;
        }

        public void ApplyPromoCode(string promoCode, decimal discountAmount)
        {
            PromoCode = promoCode;
            Discount = discountAmount;
            RecalculateTotal();
        }

        /// <summary>
        /// Set shipping cost (should be calculated externally using IShippingCalculator)
        /// </summary>
        public void SetShippingCost(decimal shippingCost)
        {
            ShippingCost = shippingCost;
            Total = Subtotal + ShippingCost - Discount;
        }

        /// <summary>
        /// Convert guest cart to user cart after login
        /// </summary>
        public void ConvertToUserCart(Guid userId)
        {
            ApplicationUserId = userId;
            AnonymousId = null;
        }
    }
}


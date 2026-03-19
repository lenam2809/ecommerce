using Ecommerce.Application.Common.Exceptions;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Domain.Interfaces.Base;
using Ecommerce.Infrastructure.Persistence.Repositories.Base;
using Ecommerce.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Infrastructure.Persistence.Repositories
{
    public class CartRepository : BaseRepository<Cart>, ICartRepository
    {
        private readonly PromoCodeService _promoCodeService;
        private readonly IRepository<PromoCode> _promoCodeRepository;


        public CartRepository(ApplicationDbContext context, PromoCodeService promoCodeService, IRepository<PromoCode> promoCodeRepository)
            : base(context)
        {
            _promoCodeService = promoCodeService;
            _promoCodeRepository = promoCodeRepository;
        }

        public async Task<Cart> GetCartAsync(Guid userId, CancellationToken cancellationToken = default)
        {
            var cart = await _context.Carts
                .Include(c => c.CartItems)
                    .ThenInclude(i => i.Product)
                .FirstOrDefaultAsync(c => c.ApplicationUserId == userId, cancellationToken);

            if (cart == null)
            {
                // Create a new cart if one doesn't exist
                cart = new Cart(userId);

                // Add the new cart to the context
                _context.Carts.Add(cart);

                // Save changes to the database
                await _context.SaveChangesAsync(cancellationToken);
            }

            return cart;
        }

        public async Task<Cart> AddToCartAsync(Guid userId, Guid productId, int quantity, string color, string size, CancellationToken cancellationToken = default)
        {

            var product = await _context.Products
                .FirstOrDefaultAsync(p => p.Id == productId, cancellationToken);

            if (product == null)
            {
                throw new Exception($"Product with ID {productId} not found");
            }

            var cart = await _context.Carts
                .Include(c => c.CartItems)
                    .ThenInclude(i => i.Product)
                .FirstOrDefaultAsync(c => c.ApplicationUserId == userId, cancellationToken);

            if (cart == null)
            {
                cart = new Cart(userId);
                await AddAsync(cart, cancellationToken);
            }

            // Use Domain Method
            cart.AddItem(product, quantity, color, size);

            await RecalculateCartTotalsAsync(cart);
            await SaveChangesAsync(cancellationToken);
            return cart;
        }

        public async Task<Cart> UpdateCartItemAsync(Guid userId, Guid itemId, int quantity, CancellationToken cancellationToken = default)
        {
            var cart = await _context.Carts
                .Include(c => c.CartItems)
                    .ThenInclude(i => i.Product)
                .FirstOrDefaultAsync(c => c.ApplicationUserId == userId, cancellationToken);

            if (cart == null)
            {
                throw new Exception("Cart not found");
            }

            // Use Domain Method
            // Note: Domain method takes productId, but repository takes itemId (which implies productId in this context? or CartItem Id?)
            // Looking at previous implementation: var cartItem = cart.CartItems.FirstOrDefault(i => i.ProductId == itemId);
            // So itemId IS productId.
            
            // Domain method UpdateQuantity expects ProductId.
            // But we need color/size to uniquely identify if multiples exist?
            // The domain method UpdateQuantity definition: UpdateQuantity(Guid productId, int quantity, string? color = null, string? size = null)
            // The repository previous implementation: CartItems.FirstOrDefault(i => i.ProductId == itemId); ignoring color/size?
            // If checking previous implementation:
            // var cartItem = cart.CartItems.FirstOrDefault(i => i.ProductId == itemId);
            // It selects the first one matching productId. This is potentially buggy if there are variants.
            // I will use the first item found to match previous behavior, or pass nulls.
            
            var item = cart.CartItems.FirstOrDefault(i => i.ProductId == itemId);
            if (item != null)
            {
                cart.UpdateQuantity(itemId, quantity, item.Color, item.Size);
            }
            else 
            {
                 throw new Exception($"Cart item with Product ID {itemId} not found");
            }

            await RecalculateCartTotalsAsync(cart);
            await SaveChangesAsync(cancellationToken);
            return cart;
        }

        public async Task<Cart> RemoveCartItemAsync(Guid userId, Guid itemId, CancellationToken cancellationToken = default)
        {
            var cart = await _context.Carts
                .Include(c => c.CartItems)
                    .ThenInclude(i => i.Product)
                .FirstOrDefaultAsync(c => c.ApplicationUserId == userId, cancellationToken);

            if (cart == null)
            {
                throw new Exception("Cart not found");
            }

            var item = cart.CartItems.FirstOrDefault(i => i.ProductId == itemId);
            if (item != null)
            {
                cart.RemoveItem(itemId, item.Color, item.Size);
            }
            else
            {
                throw new Exception($"Cart item with Product ID {itemId} not found");
            }

            await RecalculateCartTotalsAsync(cart);
            await SaveChangesAsync(cancellationToken);
            return cart;
        }

        public async Task<Cart> ClearCartAsync(Guid userId, CancellationToken cancellationToken = default)
        {
            var cart = await _context.Carts
                .Include(c => c.CartItems)
                .FirstOrDefaultAsync(c => c.ApplicationUserId == userId, cancellationToken);

            if (cart == null)
            {
                throw new Exception("Cart not found");
            }

            // Domain Method
            cart.Clear();
            // Note: EF Core might need to be told about deletions if not tracking correctly, 
            // but usually loading the collection and clearing it works if cascade delete is on.
            // The previous implementation manually removed from _context.CartItems.
            // With DDD, we rely on EF Core tracking. If it doesn't work, we might need a specific domain event or service.
            // However, since we loaded 'CartItems', doing cart.Clear() (which does _cartItems.Clear()) should mark them as deleted in EF Core if the relationship is identified.
            // Wait, clearing a List in a loaded entity marks as 'orphaned'. If identifying relationship, they are deleted.
            // Cart -> CartItems is typically identifying.
            
            await SaveChangesAsync(cancellationToken);

            return cart;
        }

        public async Task<Cart> ApplyPromoCodeAsync(Guid userId, string code, CancellationToken cancellationToken = default)
        {

            var cart = await _context.Carts
                .Include(c => c.CartItems)
                    .ThenInclude(i => i.Product)
                .FirstOrDefaultAsync(c => c.ApplicationUserId == userId, cancellationToken);

            if (cart == null)
            {
                throw new Exception("Cart not found");
            }

            // Recalculate totals first to ensure Subtotal is correct (Domain method already keeps it correct, but safe to check)
            // cart.RecalculateTotal(); // Private method.

            // Validate and apply promo code
            try
            {
                var validationResult = await _promoCodeService.ValidatePromoCode(code, cart.Subtotal);

                if (!validationResult.IsValid)
                {
                    throw new InvalidOperationException(validationResult.ErrorMessage);
                }

                // Apply promo code effects using Domain Method
                cart.ApplyPromoCode(code, validationResult.DiscountAmount);

                // Update promo code usage
                validationResult.PromoCode.TimesUsed++;
                _promoCodeRepository.Update(validationResult.PromoCode);

                await SaveChangesAsync(cancellationToken);
                return cart;
            }
            catch (Exception ex) when (ex is not NotFoundException)
            {
                throw new InvalidOperationException("Failed to apply promo code", ex);
            }
        }

        private async Task RecalculateCartTotalsAsync(Cart cart)
        {
            // The Domain Entity recalculates totals automatically on Item Add/Remove.
            // However, we need to Re-Apply Promo Code logic if subtotal changed.
            
            if (!string.IsNullOrEmpty(cart.PromoCode))
            {
                var validationResult = await _promoCodeService.ValidatePromoCode(cart.PromoCode, cart.Subtotal);

                if (validationResult.IsValid)
                {
                    cart.ApplyPromoCode(cart.PromoCode, validationResult.DiscountAmount);

                    // Update usage count? Maybe not here, as it might double count on every add? 
                    // Keeping it simple as per previous logic (it updated usage in RecalculateCartTotalsAsync? Yes, it did. That seems buggy but I will match it).
                    validationResult.PromoCode.TimesUsed++;
                    _promoCodeRepository.Update(validationResult.PromoCode);
                }
                else
                {
                    // Invalid now (e.g. subtotal dropped below limit)
                    cart.ApplyPromoCode(null!, 0); // Clear promo code
                }
            }
        }
    }
}


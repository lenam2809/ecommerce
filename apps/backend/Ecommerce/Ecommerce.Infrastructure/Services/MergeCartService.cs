using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Infrastructure.Services
{
    public class MergeCartService : IMergeCartService
    {
        private readonly IUnitOfWork _unitOfWork;

        public MergeCartService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task MergeGuestCartToUserAsync(Guid userId, string guestId, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrEmpty(guestId))
            {
                return; // No guest cart to merge
            }

            // Find guest cart
            var guestCart = await _unitOfWork.Carts
                .GetQueryable()
                .Include(c => c.CartItems)
                    .ThenInclude(i => i.Product)
                .FirstOrDefaultAsync(c => c.AnonymousId == guestId, cancellationToken);

            if (guestCart == null || !guestCart.CartItems.Any())
            {
                return; // No guest cart or empty cart
            }

            // Find user cart
            var userCart = await _unitOfWork.Carts.GetCartAsync(userId, cancellationToken);

            if (userCart == null)
            {
                // User doesn't have a cart yet, convert guest cart to user cart
                guestCart.ConvertToUserCart(userId);
                await _unitOfWork.CompleteAsync(cancellationToken);
            }
            else
            {
                // User has existing cart, merge items from guest cart
                foreach (var guestItem in guestCart.CartItems)
                {
                    // Try to find existing item with same product, color, and size
                    var existingItem = userCart.CartItems.FirstOrDefault(i =>
                        i.ProductId == guestItem.ProductId &&
                        i.Color == guestItem.Color &&
                        i.Size == guestItem.Size);

                    if (existingItem != null)
                    {
                        // Item exists, add quantities
                        userCart.UpdateQuantity(
                            guestItem.ProductId,
                            existingItem.Quantity + guestItem.Quantity,
                            guestItem.Color,
                            guestItem.Size
                        );
                    }
                    else
                    {
                        // New item, add to cart
                        userCart.AddItem(
                            guestItem.Product,
                            guestItem.Quantity,
                            guestItem.Color,
                            guestItem.Size
                        );
                    }
                }

                // Delete guest cart after merge
                _unitOfWork.Carts.Delete(guestCart);

                await _unitOfWork.CompleteAsync(cancellationToken);
            }
        }
    }
}

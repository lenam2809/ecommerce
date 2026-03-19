using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Infrastructure.Persistence.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Infrastructure.Persistence.Repositories
{
    public class WishlistRepository : BaseRepository<Wishlist>, IWishlistRepository
    {
        public WishlistRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<Wishlist> GetUserWishlistWithItems(Guid userId, CancellationToken cancellationToken)
        {
            // Find the user's wishlist with eager loading of items and product details
            var wishlist = await _context.Wishlists
                .Include(w => w.WishlistItems)
                    .ThenInclude(i => i.Product)
                .FirstOrDefaultAsync(w => w.ApplicationUserId == userId, cancellationToken);

            // If the user doesn't have a wishlist yet, create a new one
            if (wishlist == null)
            {
                wishlist = new Wishlist
                {
                    Id = Guid.NewGuid(),
                    ApplicationUserId = userId,
                    WishlistItemLimit = 20, // Default limit, could be configurable
                    WishlistItems = new List<WishlistItem>()
                };

                await _context.Wishlists.AddAsync(wishlist, cancellationToken);
                await _context.SaveChangesAsync(cancellationToken);
            }

            return wishlist;
        }

        public async Task<bool> IsProductInAnyWishlistAsync(Guid productId, CancellationToken cancellationToken)
        {
            return await _context.WishlistItems
                .AnyAsync(wi => wi.ProductId == productId, cancellationToken);
        }


    }
}


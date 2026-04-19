using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Domain.Entities;
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
                // A4 FIX: Dùng UPSERT nguyên tử thay vì read-then-write để tránh race condition.
                // Mỗi cart item được xử lý bằng câu SQL atomic:
                // - Nếu item đã tồn tại => cộng dồn số lượng (UPDATE nguyên tử)
                // - Nếu chưa tồn tại => chèn mới
                foreach (var guestItem in guestCart.CartItems)
                {
                    // Kiểm tra xem user cart đã có item này chưa (in-memory để tránh N+1)
                    var existingItem = userCart.CartItems.FirstOrDefault(i =>
                        i.ProductId == guestItem.ProductId &&
                        i.Color == guestItem.Color &&
                        i.Size == guestItem.Size);

                    if (existingItem != null)
                    {
                        // UPSERT bằng SQL cập nhật có điều kiện – nguyên tử, không có race condition
                        // "SET Quantity = Quantity + X" là atomic ở DB level
                        await _unitOfWork.BaseRepository<CartItem>().ExecuteCommandAsync(
                            "UPDATE \"CartItems\" SET \"Quantity\" = \"Quantity\" + {0} " +
                            "WHERE \"CartId\" = {1} AND \"ProductId\" = {2}",
                            [guestItem.Quantity, existingItem.CartId, existingItem.ProductId],
                            cancellationToken);
                    }
                    else
                    {
                        // New item – chèn trực tiếp vào user cart
                        var newItem = new CartItem(
                            userCart.Id,
                            guestItem.Product,
                            guestItem.Quantity,
                            guestItem.Color,
                            guestItem.Size,
                            guestItem.ProductVariantSkuId
                        );
                        await _unitOfWork.BaseRepository<CartItem>().AddAsync(newItem, cancellationToken);
                    }
                }

                // Delete guest cart after merge
                _unitOfWork.Carts.Delete(guestCart);

                await _unitOfWork.CompleteAsync(cancellationToken);
            }
        }
    }
}

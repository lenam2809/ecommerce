using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces;
using MediatR;

namespace Ecommerce.Application.Features.Wishlists.Commands.AddToWishlist
{
    public class AddToWishlistCommand : IRequest<Result<bool>>
    {
        public Guid ProductId { get; set; }
    }

    public class AddToWishlistCommandHandler : IRequestHandler<AddToWishlistCommand, Result<bool>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICurrentUserService _currentUserService;

        public AddToWishlistCommandHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUserService)
        {
            _unitOfWork = unitOfWork;
            _currentUserService = currentUserService;
        }

        public async Task<Result<bool>> Handle(AddToWishlistCommand request, CancellationToken cancellationToken)
        {

            // Check if user is authenticated
            var userId = _currentUserService.UserId;
            if (userId == null)
            {
                return Result<bool>.Unauthorized();
            }
            // Check if product exists
            var product = await _unitOfWork.Products.GetByIdAsync(request.ProductId, cancellationToken);
            if (product == null)
            {
                return Result<bool>.NotFound("Không tìm thấy sản phẩm.");
            }

            // Get or create user's wishlist
            var wishlist = await _unitOfWork.Wishlists.GetUserWishlistWithItems(userId.Value, cancellationToken);
            if (wishlist == null)
            {
                wishlist = new Wishlist
                {
                    ApplicationUserId = userId.Value
                };
                await _unitOfWork.Wishlists.AddAsync(wishlist, cancellationToken);
                await _unitOfWork.CompleteAsync(cancellationToken);
            }

            // Check if product already in wishlist
            if (wishlist.WishlistItems.Any(i => i.ProductId == request.ProductId))
            {
                return Result<bool>.BadRequest("Sản phẩm đã có trong danh sách yêu thích.");
            }

            // Check if wishlist limit reached
            if (wishlist.WishlistItems.Count >= wishlist.WishlistItemLimit)
            {
                return Result<bool>.BadRequest($"Đã đạt giới hạn {wishlist.WishlistItemLimit} sản phẩm trong danh sách yêu thích.");
            }

            // Add product to wishlist
            var wishlistItem = new WishlistItem
            {
                WishlistId = wishlist.Id,
                ProductId = request.ProductId,
                DateAdded = DateTime.Now
            };

            wishlist.WishlistItems.Add(wishlistItem);
            await _unitOfWork.CompleteAsync(cancellationToken);

            return Result<bool>.Success(true);
        }
    }
}


using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Interfaces;
using MediatR;

namespace Ecommerce.Application.Features.Wishlists.Commands.RemoveFromWishlist
{
    public class RemoveFromWishlistCommand : IRequest<Result<bool>>
    {
        public Guid ProductId { get; set; }
    }

    public class RemoveFromWishlistCommandHandler : IRequestHandler<RemoveFromWishlistCommand, Result<bool>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICurrentUserService _currentUserService;

        public RemoveFromWishlistCommandHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUserService)
        {
            _unitOfWork = unitOfWork;
            _currentUserService = currentUserService;
        }

        public async Task<Result<bool>> Handle(RemoveFromWishlistCommand request, CancellationToken cancellationToken)
        {
            // Check if user is authenticated
            var userId = _currentUserService.UserId;
            if (userId == null)
            {
                return Result<bool>.Unauthorized();
            }
            var wishlist = await _unitOfWork.Wishlists.GetUserWishlistWithItems(userId.Value, cancellationToken);
            if (wishlist == null)
            {
                return Result<bool>.NotFound("Không tìm thấy danh sách yêu thích.");
            }

            var wishlistItem = wishlist.WishlistItems.FirstOrDefault(i => i.ProductId == request.ProductId);
            if (wishlistItem == null)
            {
                return Result<bool>.NotFound("Không tìm thấy sản phẩm trong danh sách yêu thích.");
            }

            wishlist.WishlistItems.Remove(wishlistItem);
            await _unitOfWork.CompleteAsync(cancellationToken);

            return Result<bool>.Success(true);
        }
    }
}


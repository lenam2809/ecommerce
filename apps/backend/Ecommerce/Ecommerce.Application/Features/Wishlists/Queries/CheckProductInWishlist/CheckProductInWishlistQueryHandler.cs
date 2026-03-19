using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Interfaces;
using MediatR;

namespace Ecommerce.Application.Features.Wishlists.Queries.CheckProductInWishlist
{
    public class CheckProductInWishlistQueryHandler : IRequestHandler<CheckProductInWishlistQuery, Result<bool>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICurrentUserService _currentUserService;

        public CheckProductInWishlistQueryHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUserService)
        {
            _unitOfWork = unitOfWork;
            _currentUserService = currentUserService;
        }

        public async Task<Result<bool>> Handle(CheckProductInWishlistQuery request, CancellationToken cancellationToken)
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
                return Result<bool>.Success(false);
            }

            bool isInWishlist = wishlist.WishlistItems.Any(i => i.ProductId == request.ProductId);
            return Result<bool>.Success(isInWishlist);
        }
    }
}


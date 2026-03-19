using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Wishlists.Dto;
using Ecommerce.Domain.Interfaces;
using AutoMapper;
using MediatR;

namespace Ecommerce.Application.Features.Wishlists.Queries.GetUserWishlist
{
    public class GetUserWishlistQueryHandler : IRequestHandler<GetUserWishlistQuery, Result<WishlistDto>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ICurrentUserService _currentUserService;
        private readonly IFileStorageService _fileStorageService;


        public GetUserWishlistQueryHandler(IUnitOfWork unitOfWork,
            IMapper mapper,
            ICurrentUserService currentUserService,
            IFileStorageService fileStorageService)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _currentUserService = currentUserService;
            _fileStorageService = fileStorageService;
        }

        public async Task<Result<WishlistDto>> Handle(GetUserWishlistQuery request, CancellationToken cancellationToken)
        {
            // Check if the user is authenticated
            var userId = _currentUserService.UserId;
            if (userId == null)
            {
                return Result<WishlistDto>.Unauthorized();
            }

            var wishlist = await _unitOfWork.Wishlists.GetUserWishlistWithItems(userId.Value, cancellationToken);

            if (wishlist == null)
            {
                return Result<WishlistDto>.NotFound("Không tìm thấy danh sách yêu thích");
            }

            var wishlistDto = _mapper.Map<WishlistDto>(wishlist);
            foreach (var item in wishlistDto.Items)
            {
                // Assuming you have a method to get the main image URL for the product
                item.ImageUrl = await _fileStorageService.GetFileUrlAsync(item.ImageUrl);
            }

            return Result<WishlistDto>.Success(wishlistDto);
        }
    }
}


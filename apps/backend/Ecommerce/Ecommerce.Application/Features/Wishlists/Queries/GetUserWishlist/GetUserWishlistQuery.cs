using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Wishlists.Dto;
using MediatR;

namespace Ecommerce.Application.Features.Wishlists.Queries.GetUserWishlist
{
    public class GetUserWishlistQuery : IRequest<Result<WishlistDto>>
    {
    }
}


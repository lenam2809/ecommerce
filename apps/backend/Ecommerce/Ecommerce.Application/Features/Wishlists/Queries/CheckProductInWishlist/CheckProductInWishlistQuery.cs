using Ecommerce.Application.Common.Models;
using MediatR;

namespace Ecommerce.Application.Features.Wishlists.Queries.CheckProductInWishlist
{
    public class CheckProductInWishlistQuery : IRequest<Result<bool>>
    {
        public Guid ProductId { get; set; }
    }
}


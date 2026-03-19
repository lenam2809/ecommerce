using Ecommerce.Application.Features.Wishlists.Commands.AddToWishlist;
using Ecommerce.Application.Features.Wishlists.Commands.RemoveFromWishlist;
using Ecommerce.Application.Features.Wishlists.Queries.CheckProductInWishlist;
using Ecommerce.Application.Features.Wishlists.Queries.GetUserWishlist;
using Ecommerce.WebAPI.Extensions;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Ecommerce.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class WishlistController : ControllerBase
    {
        private readonly IMediator _mediator;

        public WishlistController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<IActionResult> GetUserWishlist()
        {
            var result = await _mediator.Send(new GetUserWishlistQuery());

            return result.ToActionResult();
        }

        [HttpPost("add/{productId}")]
        public async Task<IActionResult> AddToWishlist(Guid productId)
        {
            var command = new AddToWishlistCommand
            {
                ProductId = productId
            };

            var result = await _mediator.Send(command);

            return result.ToActionResult();
        }

        [HttpDelete("remove/{productId}")]
        public async Task<IActionResult> RemoveFromWishlist(Guid productId)
        {
            var command = new RemoveFromWishlistCommand
            {
                ProductId = productId
            };

            var result = await _mediator.Send(command);

            return result.ToActionResult();
        }

        [HttpGet("check/{productId}")]
        public async Task<IActionResult> CheckProductInWishlist(Guid productId)
        {
            var query = new CheckProductInWishlistQuery
            {
                ProductId = productId
            };

            var result = await _mediator.Send(query);

            return result.ToActionResult();
        }
    }
}


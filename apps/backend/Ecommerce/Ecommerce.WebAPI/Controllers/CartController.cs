using Ecommerce.Application.Features.Cart.Commands.AddToCart;
using Ecommerce.Application.Features.Cart.Commands.ApplyPromoCode;
using Ecommerce.Application.Features.Cart.Commands.ClearCart;
using Ecommerce.Application.Features.Cart.Commands.RemoveCartItem;
using Ecommerce.Application.Features.Cart.Commands.UpdateCartItem;
using Ecommerce.Application.Features.Cart.Queries.GetCart;
using Ecommerce.WebAPI.Extensions;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Ecommerce.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [AllowAnonymous] // Allow guest users to access cart endpoints
    public class CartController : ControllerBase
    {
        private readonly IMediator _mediator;

        public CartController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>
        /// Get the current user's cart
        /// </summary>
        /// <returns>The cart with all items and pricing information</returns>
        [HttpGet]
        public async Task<IActionResult> GetCart()
        {
            var result = await _mediator.Send(new GetCartQuery());
            return result.ToActionResult();
        }

        /// <summary>
        /// Add a product to the cart
        /// </summary>
        /// <param name="command">Product and quantity information</param>
        /// <returns>The updated cart</returns>
        [HttpPost("items")]
        public async Task<IActionResult> AddToCart(AddToCartCommand command)
        {
            var result = await _mediator.Send(command);
            return result.ToActionResult();
        }

        /// <summary>
        /// Update a cart item's quantity
        /// </summary>
        /// <param name="command">Cart item ID and new quantity</param>
        /// <returns>The updated cart</returns>
        [HttpPut("items")]
        public async Task<IActionResult> UpdateCartItem(UpdateCartItemCommand command)
        {
            var result = await _mediator.Send(command);
            return result.ToActionResult();
        }

        /// <summary>
        /// Remove an item from the cart
        /// </summary>
        /// <param name="command">Cart item ID to remove</param>
        /// <returns>The updated cart</returns>
        [HttpDelete("items/{id}")]
        public async Task<IActionResult> RemoveCartItem(Guid id)
        {
            var result = await _mediator.Send(new RemoveCartItemCommand { ItemId = id });
            return result.ToActionResult();
        }

        /// <summary>
        /// Clear all items from the cart
        /// </summary>
        /// <returns>The empty cart</returns>
        [HttpDelete]
        public async Task<IActionResult> ClearCart()
        {
            var result = await _mediator.Send(new ClearCartCommand());
            return result.ToActionResult();
        }

        /// <summary>
        /// Apply a promo code to the cart
        /// </summary>
        /// <param name="command">Promo code to apply</param>
        /// <returns>The updated cart with discount applied</returns>
        [HttpPost("promo")]
        public async Task<IActionResult> ApplyPromoCode(ApplyPromoCodeCommand command)
        {
            var result = await _mediator.Send(command);
            return result.ToActionResult();
        }
    }
}


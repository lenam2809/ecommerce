using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Cart.Dto;
using MediatR;

namespace Ecommerce.Application.Features.Cart.Commands.UpdateCartItem
{
    public class UpdateCartItemCommand : IRequest<Result<CartDto>>
    {
        public Guid ItemId { get; set; }
        public int Quantity { get; set; }
    }
}


using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Cart.Dto;
using MediatR;

namespace Ecommerce.Application.Features.Cart.Commands.AddToCart
{
    public class AddToCartCommand : IRequest<Result<CartDto>>
    {
        public Guid ProductId { get; set; }
        public int Quantity { get; set; }
        public string? Color { get; set; }
        public string? Size { get; set; }
    }
}


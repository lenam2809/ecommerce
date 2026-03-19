using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Cart.Dto;
using MediatR;

namespace Ecommerce.Application.Features.Cart.Commands.RemoveCartItem
{
    public class RemoveCartItemCommand : IRequest<Result<CartDto>>
    {
        public Guid ItemId { get; set; }
    }
}


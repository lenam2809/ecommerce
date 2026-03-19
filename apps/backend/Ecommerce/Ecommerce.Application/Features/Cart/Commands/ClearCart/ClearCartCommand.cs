using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Cart.Dto;
using MediatR;

namespace Ecommerce.Application.Features.Cart.Commands.ClearCart
{
    public class ClearCartCommand : IRequest<Result<CartDto>>
    {
    }
}


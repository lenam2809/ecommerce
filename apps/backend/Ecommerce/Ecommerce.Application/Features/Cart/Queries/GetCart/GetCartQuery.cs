using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Cart.Dto;
using MediatR;

namespace Ecommerce.Application.Features.Cart.Queries.GetCart
{
    public class GetCartQuery : IRequest<Result<CartDto>>
    {
    }
}


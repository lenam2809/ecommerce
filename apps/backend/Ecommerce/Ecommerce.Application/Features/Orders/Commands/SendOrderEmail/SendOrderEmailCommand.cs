using Ecommerce.Application.Common.Models;
using MediatR;

namespace Ecommerce.Application.Features.Orders.Commands.SendOrderEmail
{
    public sealed record SendOrderEmailCommand(Guid OrderId) : IRequest<Result<Unit>>;
}

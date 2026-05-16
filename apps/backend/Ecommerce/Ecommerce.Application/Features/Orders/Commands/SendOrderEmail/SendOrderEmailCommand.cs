using Ecommerce.Application.Common.Models;
using MediatR;

using Ecommerce.Application.Common.Interfaces;

namespace Ecommerce.Application.Features.Orders.Commands.SendOrderEmail
{
    public sealed record SendOrderEmailCommand(Guid OrderId) : ICommand<Result<Unit>>;
}

using MediatR;

namespace Ecommerce.Application.Common.Interfaces;

public interface ICommand<out TResponse> : IRequest<TResponse>
{
}

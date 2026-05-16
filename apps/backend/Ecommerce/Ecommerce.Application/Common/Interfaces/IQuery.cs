using MediatR;

namespace Ecommerce.Application.Common.Interfaces;

public interface IQuery<out TResponse> : IRequest<TResponse>
{
}

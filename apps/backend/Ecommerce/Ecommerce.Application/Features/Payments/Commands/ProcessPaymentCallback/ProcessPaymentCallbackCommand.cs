using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;

namespace Ecommerce.Application.Features.Payments.Commands.ProcessPaymentCallback;

public sealed class ProcessPaymentCallbackCommand : ICommand<Result<ProcessPaymentCallbackResultDto>>
{
    public IReadOnlyDictionary<string, string> Parameters { get; init; } = new Dictionary<string, string>();
}

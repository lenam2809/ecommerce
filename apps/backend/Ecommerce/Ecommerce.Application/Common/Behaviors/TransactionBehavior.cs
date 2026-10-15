using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Domain.Interfaces.Logging;
using MediatR;

namespace Ecommerce.Application.Common.Behaviors
{
    public class TransactionBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
        where TRequest : IRequest<TResponse>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IEnhancedLogger _logger;

        public TransactionBehavior(IUnitOfWork unitOfWork, IEnhancedLogger logger)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
        {
            if (request is IQuery<TResponse> || request is INonTransactionalRequest || _unitOfWork.HasActiveTransaction)
            {
                return await next();
            }

            // Gradual migration fallback: unmarked requests are treated as commands so
            // existing mutation flows keep their previous transaction boundary until
            // all IRequest types are explicitly classified.
            _ = request is ICommand<TResponse>;

            return await _unitOfWork.ExecuteStrategyAsync(async () =>
            {
                try
                {
                    await _unitOfWork.BeginTransactionAsync(cancellationToken);

                    var response = await next();

                    if (response is IAppResult { IsSuccess: false } appResult)
                    {
                        await _logger.LogAsync(
                            ELogLevel.Warning,
                            $"Command {typeof(TRequest).Name} returned failure result ({appResult.ErrorType}: {appResult.Error}). Rolling back transaction.",
                            "TransactionRollback",
                            properties: new Dictionary<string, object?>
                            {
                                { "CommandName", typeof(TRequest).Name },
                                { "ErrorType", appResult.ErrorType.ToString() },
                                { "Error", appResult.Error }
                            });
                        await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                        return response;
                    }

                    await _unitOfWork.CommitTransactionAsync(cancellationToken);

                    return response;
                }
                catch (Exception)
                {
                    await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                    throw;
                }
            }, cancellationToken);
        }
    }
}

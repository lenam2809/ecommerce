using Ecommerce.Application.Common.Models;
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
            // Chá»‰ Ã¡p dá»¥ng Transaction cho cÃ¡c Command (thay Ä‘á»•i dá»¯ liá»‡u)
            // Query thÆ°á»ng khÃ´ng cáº§n transaction (hoáº·c chá»‰ cáº§n read-only transaction náº¿u muá»‘n isolation cao)
            // CÃ¡ch Ä‘Æ¡n giáº£n nháº¥t lÃ  check tÃªn class hoáº·c interface marker, nhÆ°ng á»Ÿ Ä‘Ã¢y ta check behavior
            // Náº¿u request khÃ´ng pháº£i lÃ  command (thÆ°á»ng káº¿t thÃºc báº±ng Command), cÃ³ thá»ƒ bá» qua.
            // Tuy nhiÃªn, Ä‘á»ƒ an toÃ n vÃ  nháº¥t quÃ¡n, ta cÃ³ thá»ƒ Ã¡p dá»¥ng cho táº¥t cáº£ cÃ¡c request Ä‘i qua pipeline nÃ y
            // hoáº·c lá»c dá»±a trÃªn tÃªn. á»ž Ä‘Ã¢y tÃ´i sáº½ Ã¡p dá»¥ng cho táº¥t cáº£ cÃ¡c Request tráº£ vá» Result (thÆ°á»ng lÃ  Command/Query chÃ­nh).
            // Má»™t cÃ¡ch tá»‘t hÆ¡n lÃ  Ä‘á»‹nh nghÄ©a ICommand vÃ  IQuery, nhÆ°ng dá»±a trÃªn code hiá»‡n táº¡i, ta sáº½ cháº¡y transaction cho táº¥t cáº£.
            
            // Tuy nhiÃªn, GET requests (Queries) khÃ´ng nÃªn má»Ÿ Transaction Ä‘á»ƒ tá»‘i Æ°u hiá»‡u nÄƒng.
            // Ta sáº½ check tÃªn request.
            var requestName = typeof(TRequest).Name;
            if (requestName.EndsWith("Query") || _unitOfWork.HasActiveTransaction)
            {
                return await next();
            }

            return await _unitOfWork.ExecuteStrategyAsync(async () =>
            {
                try
                {
                    await _unitOfWork.BeginTransactionAsync(cancellationToken);

                    var response = await next();

                    // Kiá»ƒm tra xem response cÃ³ pháº£i lÃ  Result failure khÃ´ng
                    // Náº¿u tháº¥t báº¡i logic (vÃ­ dá»¥ validate sai trong handler), ta váº«n commit transaction DB (vÃ¬ khÃ´ng cÃ³ gÃ¬ thay Ä‘á»•i DB)
                    // NhÆ°ng náº¿u handler nÃ©m exception, catch block sáº½ rollback.

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


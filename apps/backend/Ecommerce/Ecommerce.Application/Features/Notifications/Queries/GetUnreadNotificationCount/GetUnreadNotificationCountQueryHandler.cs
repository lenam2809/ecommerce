using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Domain.Interfaces.Logging;
using MediatR;

namespace Ecommerce.Application.Features.Notifications.Queries.GetUnreadNotificationCount
{
    public class GetUnreadNotificationCountQueryHandler : IRequestHandler<GetUnreadNotificationCountQuery, Result<int>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IEnhancedLogger _logger;

        public GetUnreadNotificationCountQueryHandler(IUnitOfWork unitOfWork, IEnhancedLogger logger)
        {
            _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<Result<int>> Handle(GetUnreadNotificationCountQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var count = await _unitOfWork.Notifications.CountUnreadNotificationsAsync(request.UserId, cancellationToken);
                return Result<int>.Success(count);
            }
            catch (Exception ex)
            {
                await _logger.LogExceptionAsync(ex, "GetUnreadNotificationCountQueryHandler.Handle");
                return Result<int>.BadRequest(ex.Message);
            }
        }
    }
}


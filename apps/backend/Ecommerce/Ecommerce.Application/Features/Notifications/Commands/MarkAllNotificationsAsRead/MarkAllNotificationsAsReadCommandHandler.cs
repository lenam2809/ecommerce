using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Domain.Interfaces.Logging;
using MediatR;

namespace Ecommerce.Application.Features.Notifications.Commands.MarkAllNotificationsAsRead
{
    public class MarkAllNotificationsAsReadCommandHandler : IRequestHandler<MarkAllNotificationsAsReadCommand, Result<bool>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IEnhancedLogger _logger;

        public MarkAllNotificationsAsReadCommandHandler(IUnitOfWork unitOfWork, IEnhancedLogger logger)
        {
            _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<Result<bool>> Handle(MarkAllNotificationsAsReadCommand request, CancellationToken cancellationToken)
        {
            try
            {
                await _unitOfWork.Notifications.MarkAllAsReadAsync(request.UserId, cancellationToken);
                await _unitOfWork.CompleteAsync(cancellationToken);

                return Result<bool>.Success(true);
            }
            catch (Exception ex)
            {
                await _logger.LogExceptionAsync(ex, "MarkAllNotificationsAsReadCommandHandler.Handle");
                return Result<bool>.BadRequest(ex.Message);
            }
        }
    }
}


using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Notifications.Dto;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Domain.Interfaces.Logging;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Application.Features.Notifications.Queries.GetNotificationStatistics
{
    public class GetNotificationStatisticsQueryHandler : IRequestHandler<GetNotificationStatisticsQuery, Result<NotificationStatisticsDto>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IEnhancedLogger _logger;
        private readonly IMapper _mapper;

        public GetNotificationStatisticsQueryHandler(IUnitOfWork unitOfWork, IEnhancedLogger logger, IMapper mapper)
        {
            _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
        }

        public async Task<Result<NotificationStatisticsDto>> Handle(GetNotificationStatisticsQuery request, CancellationToken cancellationToken)
        {
            try
            {
                // Get notifications by category
                var categoryStatistics = await _unitOfWork.Notifications.GetNotificationStatisticsAsync(
                    request.UserId,
                    request.FromDate,
                    request.ToDate,
                    cancellationToken);

                // Get base query for additional statistics
                var query = _unitOfWork.Notifications.GetQueryable();

                if (request.UserId.HasValue)
                    query = query.Where(n => n.RecipientId == request.UserId || n.RecipientId == null);

                if (request.FromDate.HasValue)
                    query = query.Where(n => n.CreatedAt >= request.FromDate.Value);

                if (request.ToDate.HasValue)
                    query = query.Where(n => n.CreatedAt <= request.ToDate.Value);

                var total = await query.CountAsync(cancellationToken);
                var read = await query.CountAsync(n => n.IsRead, cancellationToken);
                var unread = await query.CountAsync(n => !n.IsRead, cancellationToken);
                var expired = await query.CountAsync(n => n.ExpiresAt.HasValue && n.ExpiresAt < DateTime.UtcNow, cancellationToken);
                var byType = await query.GroupBy(n => n.Type)
                                        .ToDictionaryAsync(g => g.Key.ToString(), g => g.Count(), cancellationToken);
                var byMonth = await query.GroupBy(n => new { n.CreatedAt.Year, n.CreatedAt.Month })
                                         .ToDictionaryAsync(
                                             g => $"{g.Key.Year}-{g.Key.Month:D2}",
                                             g => g.Count(),
                                             cancellationToken);



                var statisticsDto = new NotificationStatisticsDto
                {
                    TotalNotifications = total,
                    ReadNotifications = read,
                    UnreadNotifications = unread,
                    ExpiredNotifications = expired,
                    NotificationsByCategory = categoryStatistics.ToDictionary(kvp => kvp.Key.ToString(), kvp => kvp.Value),
                    NotificationsByType = byType,
                    NotificationsByMonth = byMonth
                };

                return Result<NotificationStatisticsDto>.Success(statisticsDto);
            }
            catch (Exception ex)
            {
                await _logger.LogExceptionAsync(ex, "GetNotificationStatisticsQueryHandler.Handle");
                return Result<NotificationStatisticsDto>.BadRequest(ex.Message);
            }
        }
    }
}


using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Notifications.Dto;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Domain.Interfaces.Logging;
using AutoMapper;
using MediatR;
using System.Linq.Expressions;

namespace Ecommerce.Application.Features.Notifications.Queries.GetUserNotifications
{
    public class GetUserNotificationsQueryHandler : IRequestHandler<GetUserNotificationsQuery, Result<PaginatedList<NotificationDto>>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IEnhancedLogger _logger;
        private readonly IFileStorageService _fileStorageService;

        public GetUserNotificationsQueryHandler(
            IUnitOfWork unitOfWork,
            IMapper mapper,
            IEnhancedLogger logger,
            IFileStorageService fileStorageService)
        {
            _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _fileStorageService = fileStorageService;
        }

        public async Task<Result<PaginatedList<NotificationDto>>> Handle(GetUserNotificationsQuery request, CancellationToken cancellationToken)
        {
            try
            {
                // Xây dựng biểu thức filter
                Expression<Func<Notification, bool>> filter = notification =>
                    notification.RecipientId == request.UserId &&
                    (request.IsRead == null || notification.IsRead == request.IsRead) &&
                    (request.Category == null || notification.Category == request.Category) &&
                    (notification.ExpiresAt == null || notification.ExpiresAt > DateTime.UtcNow);

                // Xây dựng sắp xếp
                Func<IQueryable<Notification>, IOrderedQueryable<Notification>> orderBy = query =>
                {
                    return request.SortBy.ToLower() switch
                    {
                        "title" => request.IsDescending
                            ? query.OrderByDescending(n => n.Title)
                            : query.OrderBy(n => n.Title),
                        "category" => request.IsDescending
                            ? query.OrderByDescending(n => n.Category)
                            : query.OrderBy(n => n.Category),
                        "type" => request.IsDescending
                            ? query.OrderByDescending(n => n.Type)
                            : query.OrderBy(n => n.Type),
                        "isread" => request.IsDescending
                            ? query.OrderByDescending(n => n.IsRead)
                            : query.OrderBy(n => n.IsRead),
                        "createdat" => request.IsDescending
                            ? query.OrderByDescending(n => n.CreatedAt)
                            : query.OrderBy(n => n.CreatedAt),
                        _ => query.OrderByDescending(n => n.CreatedAt)
                    };
                };

                // Gọi phương thức GetPaginatedAsync
                var paginatedResult = await _unitOfWork.Notifications
                    .GetPaginatedAsync(
                        filter: filter,
                        orderBy: orderBy,
                        pageIndex: request.PageNumber,
                        pageSize: request.PageSize,
                        cancellationToken: cancellationToken);

                // Ánh xạ kết quả sang DTO
                var notificationDtos = _mapper.Map<List<NotificationDto>>(paginatedResult.Items);

                // Chuyển đổi hình ảnh từ đường dẫn sang URL
                foreach (var notificationDto in notificationDtos)
                {
                    if (!string.IsNullOrEmpty(notificationDto.ImageUrl))
                    {
                        notificationDto.ImageUrl = await _fileStorageService.GetFileUrlAsync(notificationDto.ImageUrl);
                    }
                }

                // Tạo kết quả trả về
                var result = new PaginatedList<NotificationDto>(
                    notificationDtos,
                    paginatedResult.TotalCount,
                    paginatedResult.PageIndex,
                    paginatedResult.PageSize);

                return Result<PaginatedList<NotificationDto>>.Success(result);
            }
            catch (Exception ex)
            {
                await _logger.LogExceptionAsync(ex, "GetUserNotificationsQueryHandler.Handle");
                return Result<PaginatedList<NotificationDto>>.BadRequest(ex.Message);
            }

        }
    }
}


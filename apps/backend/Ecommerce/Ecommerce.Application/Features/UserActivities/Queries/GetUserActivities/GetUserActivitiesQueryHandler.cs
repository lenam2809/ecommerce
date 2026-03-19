using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.UserActivities.Dto;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace Ecommerce.Application.Features.UserActivities.Queries.GetUserActivities
{
    public class GetUserActivitiesQueryHandler : IRequestHandler<GetUserActivitiesQuery, Result<PaginatedList<UserActivityDto>>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICurrentUserService _currentUserService;

        public GetUserActivitiesQueryHandler(
            IUnitOfWork unitOfWork,
            ICurrentUserService currentUserService)
        {
            _unitOfWork = unitOfWork;
            _currentUserService = currentUserService;
        }

        public async Task<Result<PaginatedList<UserActivityDto>>> Handle(GetUserActivitiesQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var currentUserId = _currentUserService.UserId;
                var isAdmin = await _currentUserService.IsInRoleAsync("Admin");

                // Xác định userId cần query
                var targetUserId = request.UserId ?? currentUserId;

                // Kiểm tra quyền: Admin có thể xem mọi user, user thường chỉ xem của mình
                if (!isAdmin && targetUserId != currentUserId)
                {
                    return Result<PaginatedList<UserActivityDto>>.Unauthorized("Không có quyền xem hoạt động của người dùng khác");
                }

                if (!targetUserId.HasValue)
                {
                    return Result<PaginatedList<UserActivityDto>>.BadRequest("Không xác định được người dùng");
                }

                // Build filter expression
                Expression<Func<UserActivity, bool>> filter = ua =>
                    ua.UserId == targetUserId.Value &&
                    (!request.StartDate.HasValue || ua.Timestamp >= request.StartDate.Value) &&
                    (!request.EndDate.HasValue || ua.Timestamp <= request.EndDate.Value) &&
                    (string.IsNullOrEmpty(request.ActivityType) || ua.ActivityType == request.ActivityType) &&
                    (string.IsNullOrEmpty(request.SearchTerm) ||
                     ua.Description.Contains(request.SearchTerm) ||
                     ua.ActivityType.Contains(request.SearchTerm));

                // Build ordering
                Func<IQueryable<UserActivity>, IOrderedQueryable<UserActivity>> orderBy = query =>
                {
                    return request.SortBy.ToLower() switch
                    {
                        "activitytype" => request.IsDescending
                            ? query.OrderByDescending(ua => ua.ActivityType)
                            : query.OrderBy(ua => ua.ActivityType),
                        "description" => request.IsDescending
                            ? query.OrderByDescending(ua => ua.Description)
                            : query.OrderBy(ua => ua.Description),
                        "timestamp" => request.IsDescending
                            ? query.OrderByDescending(ua => ua.Timestamp)
                            : query.OrderBy(ua => ua.Timestamp),
                        _ => query.OrderByDescending(ua => ua.Timestamp)
                    };
                };

                // Get paginated data
                var paginatedResult = await _unitOfWork.UserActivities
                    .GetPaginatedAsync(
                        filter: filter,
                        orderBy: orderBy,
                        pageIndex: request.PageNumber,
                        pageSize: request.PageSize,
                        cancellationToken: cancellationToken,
                        includeFunc: ua => ua.Include(x => x.User));

                // Map to DTOs
                var activityDtos = paginatedResult.Items.Select(activity => new UserActivityDto
                {
                    Id = activity.Id,
                    UserId = activity.UserId,
                    UserName = activity.User?.UserName,
                    UserEmail = activity.User?.Email,
                    ActivityType = activity.ActivityType,
                    Description = activity.Description,
                    IpAddress = activity.IpAddress,
                    UserAgent = activity.UserAgent,
                    Location = activity.Location,
                    Timestamp = activity.Timestamp,
                    //AdditionalData = !string.IsNullOrEmpty(activity.AdditionalData)
                    //    ? System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(activity.AdditionalData)
                    //    : new Dictionary<string, object>()
                }).ToList();

                var result = new PaginatedList<UserActivityDto>(
                    activityDtos,
                    paginatedResult.TotalCount,
                    paginatedResult.PageIndex,
                    paginatedResult.PageSize);

                return Result<PaginatedList<UserActivityDto>>.Success(result);
            }
            catch (Exception ex)
            {
                return Result<PaginatedList<UserActivityDto>>.BadRequest(ex.Message);
            }
        }
    }
}


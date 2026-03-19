using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Features.UserActivities.Dto;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces;
using Microsoft.AspNetCore.Http;
using System.Text.Json;

namespace Ecommerce.Infrastructure.Services
{
    public class UserActivityService : IUserActivityService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICurrentUserService _currentUserService;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public UserActivityService(
            IUnitOfWork unitOfWork,
            ICurrentUserService currentUserService,
            IHttpContextAccessor httpContextAccessor)
        {
            _unitOfWork = unitOfWork;
            _currentUserService = currentUserService;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task LogActivityAsync(string activityType, string description = null, object additionalData = null, Guid? userId = null)
        {
            if (!userId.HasValue)
            {
                if (_currentUserService.UserId.HasValue)
                {
                    userId = _currentUserService.UserId;
                }
                else
                {
                    return;
                }
            }

            var httpContext = _httpContextAccessor.HttpContext;
            var ipAddress = httpContext?.Connection?.RemoteIpAddress?.ToString();
            var userAgent = httpContext?.Request?.Headers.UserAgent.ToString();

            await _unitOfWork.UserActivities.LogActivityAsync(
                userId.Value,
                activityType,
                description ?? activityType,
                ipAddress,
                userAgent,
                additionalData);

            await _unitOfWork.CompleteAsync();
        }

        public async Task<IEnumerable<UserActivityDto>> GetRecentActivitiesAsync(int count = 10)
        {
            var userId = _currentUserService.UserId;
            if (!userId.HasValue) return [];

            var activities = await _unitOfWork.UserActivities.GetRecentActivitiesByUserAsync(userId.Value, count);

            return activities.Select(MapToDto);
        }

        public async Task<IEnumerable<UserActivityDto>> GetUserActivitiesAsync(Guid userId, DateTime? from = null, DateTime? to = null)
        {
            var activities = await _unitOfWork.UserActivities.GetActivitiesByUserAsync(userId, from, to);
            return activities.Select(MapToDto);
        }

        private UserActivityDto MapToDto(UserActivity activity)
        {
            return new UserActivityDto
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
                AdditionalData = !string.IsNullOrEmpty(activity.AdditionalData)
                    ? JsonSerializer.Deserialize<Dictionary<string, object>>(activity.AdditionalData)
                    : new Dictionary<string, object>()
            };
        }
    }
}


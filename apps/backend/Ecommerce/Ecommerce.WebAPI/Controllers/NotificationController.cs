using Ecommerce.Application.Features.Notifications.Commands.DeleteNotification;
using Ecommerce.Application.Features.Notifications.Commands.MarkAllNotificationsAsRead;
using Ecommerce.Application.Features.Notifications.Commands.MarkNotificationAsRead;
using Ecommerce.Application.Features.Notifications.Commands.SendMaintenanceNotification;
using Ecommerce.Application.Features.Notifications.Commands.SendPromotionNotification;
using Ecommerce.Application.Features.Notifications.Queries.GetNotificationStatistics;
using Ecommerce.Application.Features.Notifications.Queries.GetSystemNotifications;
using Ecommerce.Application.Features.Notifications.Queries.GetUnreadNotificationCount;
using Ecommerce.Application.Features.Notifications.Queries.GetUserNotifications;
using Ecommerce.Domain.Enums;
using Ecommerce.WebAPI.Extensions;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Ecommerce.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class NotificationController : ControllerBase
    {
        private readonly IMediator _mediator;

        public NotificationController(IMediator mediator)
        {
            _mediator = mediator ?? throw new ArgumentNullException(nameof(mediator));
        }

        /// <summary>
        /// Lấy danh sách thông báo của user hiện tại
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetUserNotifications(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] bool? isRead = null,
            [FromQuery] ENotificationCategory? category = null,
            [FromQuery] string sortBy = "createdAt",
            [FromQuery] bool isDescending = true,
            CancellationToken cancellationToken = default)
        {
            var userId = GetCurrentUserId();
            if (userId == Guid.Empty)
                return Unauthorized();

            var query = new GetUserNotificationsQuery
            {
                UserId = userId,
                PageNumber = page,
                PageSize = pageSize,
                IsRead = isRead,
                Category = category,
                SortBy = sortBy,
                IsDescending = isDescending
            };

            var result = await _mediator.Send(query, cancellationToken);

            return result.ToActionResult();
        }

        /// <summary>
        /// Lấy số lượng thông báo chưa đọc
        /// </summary>
        [HttpGet("unread-count")]
        public async Task<IActionResult> GetUnreadCount(CancellationToken cancellationToken = default)
        {
            var userId = GetCurrentUserId();
            if (userId == Guid.Empty)
                return Unauthorized();

            var query = new GetUnreadNotificationCountQuery { UserId = userId };
            var result = await _mediator.Send(query, cancellationToken);

            return result.ToActionResult();
        }

        /// <summary>
        /// Đánh dấu thông báo đã đọc
        /// </summary>
        [HttpPut("{id}/mark-read")]
        public async Task<IActionResult> MarkAsRead(Guid id, CancellationToken cancellationToken = default)
        {
            var userId = GetCurrentUserId();
            if (userId == Guid.Empty)
                return Unauthorized();

            var command = new MarkNotificationAsReadCommand
            {
                NotificationId = id,
                UserId = userId
            };

            var result = await _mediator.Send(command, cancellationToken);

            return result.ToActionResult();
        }

        /// <summary>
        /// Đánh dấu tất cả thông báo đã đọc
        /// </summary>
        [HttpPut("mark-all-read")]
        public async Task<IActionResult> MarkAllAsRead(CancellationToken cancellationToken = default)
        {
            var userId = GetCurrentUserId();
            if (userId == Guid.Empty)
                return Unauthorized();

            var command = new MarkAllNotificationsAsReadCommand { UserId = userId };
            var result = await _mediator.Send(command, cancellationToken);

            return result.ToActionResult();
        }

        /// <summary>
        /// Xóa thông báo
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNotification(Guid id, CancellationToken cancellationToken = default)
        {
            var userId = GetCurrentUserId();
            if (userId == Guid.Empty)
                return Unauthorized();

            var command = new DeleteNotificationCommand
            {
                NotificationId = id,
                UserId = userId,
                IsAdmin = User.IsInRole("Admin")
            };

            var result = await _mediator.Send(command, cancellationToken);

            return result.ToActionResult();
        }

        /// <summary>
        /// Lấy thống kê thông báo (chỉ dành cho admin)
        /// </summary>
        [HttpGet("statistics")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetStatistics(
            [FromQuery] DateTime? fromDate = null,
            [FromQuery] DateTime? toDate = null,
            CancellationToken cancellationToken = default)
        {
            var query = new GetNotificationStatisticsQuery
            {
                UserId = null, // null = tất cả users
                FromDate = fromDate,
                ToDate = toDate
            };

            var result = await _mediator.Send(query, cancellationToken);

            return result.ToActionResult();
        }

        /// <summary>
        /// Lấy thống kê thông báo của user hiện tại
        /// </summary>
        [HttpGet("my-statistics")]
        public async Task<IActionResult> GetMyStatistics(
            [FromQuery] DateTime? fromDate = null,
            [FromQuery] DateTime? toDate = null,
            CancellationToken cancellationToken = default)
        {
            var userId = GetCurrentUserId();
            if (userId == Guid.Empty)
                return Unauthorized();

            var query = new GetNotificationStatisticsQuery
            {
                UserId = userId,
                FromDate = fromDate,
                ToDate = toDate
            };

            var result = await _mediator.Send(query, cancellationToken);

            return result.ToActionResult();
        }

        /// <summary>
        /// Gửi thông báo khuyến mãi (chỉ dành cho admin)
        /// </summary>
        [HttpPost("send-promotion")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> SendPromotionNotification(
            [FromBody] SendPromotionNotificationCommand command,
            CancellationToken cancellationToken = default)
        {
            var result = await _mediator.Send(command, cancellationToken);

            return result.ToActionResult();
        }

        /// <summary>
        /// Gửi thông báo bảo trì hệ thống (chỉ dành cho admin)
        /// </summary>
        [HttpPost("send-maintenance")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> SendMaintenanceNotification(
            [FromBody] SendMaintenanceNotificationCommand command,
            CancellationToken cancellationToken = default)
        {
            var result = await _mediator.Send(command, cancellationToken);

            return result.ToActionResult();
        }

        /// <summary>
        /// Lấy thông báo hệ thống (dành cho admin)
        /// </summary>
        [HttpGet("system")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetSystemNotifications(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] bool includeExpired = false,
            [FromQuery] string sortBy = "createdAt",
            [FromQuery] bool isDescending = true,
            CancellationToken cancellationToken = default)
        {
            var query = new GetSystemNotificationsQuery
            {
                PageNumber = page,
                PageSize = pageSize,
                IncludeExpired = includeExpired,
                SortBy = sortBy,
                IsDescending = isDescending
            };

            var result = await _mediator.Send(query, cancellationToken);

            return result.ToActionResult();
        }

        /// <summary>
        /// Lấy user ID hiện tại từ JWT token
        /// </summary>
        private Guid GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return Guid.TryParse(userIdClaim, out var userId) ? userId : Guid.Empty;
        }
    }
}

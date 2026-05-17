using Ecommerce.Application.Features.UserActivities.Queries.GetUserActivities;
using Ecommerce.Domain.Enums;
using Ecommerce.WebAPI.Extensions;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Ecommerce.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    //[Authorize]
    public class UserActivitiesController : ControllerBase
    {
        private readonly IMediator _mediator;

        public UserActivitiesController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>
        /// Lấy danh sách hoạt động của người dùng hiện tại hoặc user được chỉ định (Admin only)
        /// </summary>
        /// <param name="query">Tham số truy vấn</param>
        /// <returns>Danh sách hoạt động được phân trang</returns>
        [HttpGet]
        public async Task<IActionResult> GetUserActivities([FromQuery] GetUserActivitiesQuery query)
        {
            var result = await _mediator.Send(query);
            return result.ToActionResult();
        }

        /// <summary>
        /// Lấy hoạt động gần đây của người dùng hiện tại
        /// </summary>
        /// <param name="count">Số lượng hoạt động gần đây (mặc định 10)</param>
        /// <returns>Danh sách hoạt động gần đây</returns>
        [HttpGet("recent")]
        public async Task<IActionResult> GetRecentActivities([FromQuery] int count = 10)
        {
            var query = new GetUserActivitiesQuery
            {
                PageSize = count,
                PageNumber = 1
            };

            var result = await _mediator.Send(query);
            return result.ToActionResult();
        }

        /// <summary>
        /// Lấy hoạt động của một user cụ thể (Admin only)
        /// </summary>
        /// <param name="userId">ID của user</param>
        /// <param name="query">Tham số truy vấn</param>
        /// <returns>Danh sách hoạt động của user</returns>
        [HttpGet("user/{userId}")]
        [Authorize(Roles = EUserRoles.Admin)]
        public async Task<IActionResult> GetActivitiesByUser(Guid userId, [FromQuery] GetUserActivitiesQuery query)
        {
            query.UserId = userId;
            var result = await _mediator.Send(query);
            return result.ToActionResult();
        }
    }
}


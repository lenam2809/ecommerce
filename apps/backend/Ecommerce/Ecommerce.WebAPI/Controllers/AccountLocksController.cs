using Ecommerce.Application.Features.AccountLocks.Commands.LockUser;
using Ecommerce.Application.Features.AccountLocks.Commands.UnlockUser;
using Ecommerce.Application.Features.AccountLocks.Queries.GetAccountLockById;
using Ecommerce.Application.Features.AccountLocks.Queries.GetAccountLocks;
using Ecommerce.Application.Features.AccountLocks.Queries.GetAccountLockStatus;
using Ecommerce.WebAPI.Extensions;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Ecommerce.WebAPI.Controllers
{
    [Route("api/account-locks")]
    [ApiController]
    //[Authorize(Roles = "Admin")] // Chỉ Admin mới có quyền truy cập controller này
    public class AccountLocksController : ControllerBase
    {
        private readonly IMediator _mediator;

        public AccountLocksController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>
        /// Khóa tài khoản người dùng
        /// </summary>
        /// <param name="command">Thông tin khóa tài khoản</param>
        /// <returns>Kết quả khóa tài khoản</returns>
        [HttpPost("lock")]
        public async Task<IActionResult> LockUser([FromBody] LockUserCommand command)
        {
            var result = await _mediator.Send(command);
            return result.ToActionResult();
        }

        /// <summary>
        /// Mở khóa tài khoản người dùng
        /// </summary>
        /// <param name="command">Thông tin mở khóa tài khoản</param>
        /// <returns>Kết quả mở khóa tài khoản</returns>
        [HttpPost("unlock")]
        public async Task<IActionResult> UnlockUser([FromBody] UnlockUserCommand command)
        {
            var result = await _mediator.Send(command);
            return result.ToActionResult();
        }

        /// <summary>
        /// Get about section by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _mediator.Send(new GetAccountLockByIdQuery(id));
            return result.ToActionResult();
        }

        /// <summary>
        /// Lấy danh sách tài khoản bị khóa
        /// </summary>
        /// <param name="query">Tham số truy vấn</param>
        /// <returns>Danh sách tài khoản bị khóa</returns>
        [HttpGet("paged")]
        public async Task<IActionResult> GetLockedAccounts([FromQuery] GetAccountLocksQuery query)
        {
            var result = await _mediator.Send(query);
            return result.ToActionResult();
        }

        /// <summary>
        /// Kiểm tra trạng thái khóa của một tài khoản
        /// </summary>
        /// <param name="userId">ID của user</param>
        /// <returns>Thông tin khóa tài khoản</returns>
        [HttpGet("status/{userId}")]
        public async Task<IActionResult> GetLockStatus(Guid userId)
        {
            var query = new GetAccountLockStatusQuery { UserId = userId };
            var result = await _mediator.Send(query);
            return result.ToActionResult();
        }
    }
}


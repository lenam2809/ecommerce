using Ecommerce.Application.Features.AccountLocks.Commands.LockUser;
using Ecommerce.Application.Features.AccountLocks.Commands.UnlockUser;
using Ecommerce.Application.Features.AccountLocks.Queries.GetAccountLockById;
using Ecommerce.Application.Features.AccountLocks.Queries.GetAccountLocks;
using Ecommerce.Application.Features.AccountLocks.Queries.GetAccountLockStatus;
using Ecommerce.Application.Policies;
using Ecommerce.WebAPI.Extensions;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Ecommerce.WebAPI.Controllers
{
    [Route("api/account-locks")]
    [ApiController]
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
        [HttpPost("lock")]
        [Authorize(Policy = AuthorizationPolicyNames.AdminOnly)]
        public async Task<IActionResult> LockUser([FromBody] LockUserCommand command)
        {
            var result = await _mediator.Send(command);
            return result.ToActionResult();
        }

        /// <summary>
        /// Mở khóa tài khoản người dùng
        /// </summary>
        [HttpPost("unlock")]
        [Authorize(Policy = AuthorizationPolicyNames.AdminOnly)]
        public async Task<IActionResult> UnlockUser([FromBody] UnlockUserCommand command)
        {
            var result = await _mediator.Send(command);
            return result.ToActionResult();
        }

        /// <summary>
        /// Get account lock record by ID
        /// </summary>
        [HttpGet("{id}")]
        [Authorize(Policy = AuthorizationPolicyNames.AdminOnly)]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _mediator.Send(new GetAccountLockByIdQuery(id));
            return result.ToActionResult();
        }

        /// <summary>
        /// Lấy danh sách tài khoản bị khóa
        /// </summary>
        [HttpGet("paged")]
        [Authorize(Policy = AuthorizationPolicyNames.AdminOnly)]
        public async Task<IActionResult> GetLockedAccounts([FromQuery] GetAccountLocksQuery query)
        {
            var result = await _mediator.Send(query);
            return result.ToActionResult();
        }

        /// <summary>
        /// Kiểm tra trạng thái khóa của một tài khoản
        /// </summary>
        [HttpGet("status/{userId}")]
        [Authorize]
        public async Task<IActionResult> GetLockStatus(Guid userId)
        {
            var query = new GetAccountLockStatusQuery { UserId = userId };
            var result = await _mediator.Send(query);
            return result.ToActionResult();
        }
    }
}

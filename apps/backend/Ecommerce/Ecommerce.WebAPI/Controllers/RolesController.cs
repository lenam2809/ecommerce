using Ecommerce.Application.Features.Roles.Commands.AssignRoleToUser;
using Ecommerce.Application.Features.Roles.Commands.CreateRole;
using Ecommerce.Application.Features.Roles.Commands.DeleteRole;
using Ecommerce.Application.Features.Roles.Commands.UpdateRole;
using Ecommerce.Application.Features.Roles.Queries.GetAllRoles;
using Ecommerce.Application.Features.Roles.Queries.GetRoleById;
using Ecommerce.Application.Features.Roles.Queries.GetRoles;
using Ecommerce.Application.Features.Roles.Queries.GetRolesByUserId;
using Ecommerce.WebAPI.Extensions;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Ecommerce.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    //[Authorize]
    public class RolesController : ControllerBase
    {
        private readonly IMediator _mediator;

        public RolesController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>
        /// Lấy danh sách tất cả các vai trò theo trang
        /// </summary>
        [HttpGet("paged")]
        //[Authorize(Policy = "ViewRoles")]
        public async Task<IActionResult> GetAll([FromQuery] GetRolesQuery query)
        {
            var result = await _mediator.Send(query);
            return result.ToActionResult();
        }

        /// <summary>
        /// Lấy danh sách tất cả các vai trò
        /// </summary>
        [HttpGet]
        //[Authorize(Policy = "ViewRoles")]
        public async Task<IActionResult> GetAllRoles()
        {
            var result = await _mediator.Send(new GetAllRolesQuery());
            return result.ToActionResult();
        }

        /// <summary>
        /// Lấy thông tin của một vai trò theo ID
        /// </summary>
        [HttpGet("{id}")]
        //[Authorize(Policy = "ViewRoles")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _mediator.Send(new GetRoleByIdQuery { Id = id });
            return result.ToActionResult();
        }

        /// <summary>
        /// Thêm mới một vai trò
        /// </summary>
        [HttpPost]
        //[Authorize(Policy = "CreateRole")]
        public async Task<IActionResult> Create([FromBody] CreateRoleCommand command)
        {
            var result = await _mediator.Send(command);
            return result.IsSuccess ?
                CreatedAtAction(nameof(GetById), new { id = result.Value }, result.Value)
                : result.ToActionResult();
        }

        /// <summary>
        /// Cập nhật thông tin của một vai trò
        /// </summary>
        [HttpPut("{id}")]
        //[Authorize(Policy = "EditRole")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateRoleCommand command)
        {
            if (id != command.Id)
                return BadRequest("ID không hợp lệ.");

            var result = await _mediator.Send(command);
            return result.ToActionResult();
        }

        /// <summary>
        /// Xóa một vai trò theo ID
        /// </summary>
        [HttpDelete("{id}")]
        //[Authorize(Policy = "DeleteRole")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await _mediator.Send(new DeleteRoleCommand { Id = id });
            return result.ToActionResult();
        }

        /// <summary>
        /// Lấy danh sách vai trò của người dùng
        /// </summary>
        [HttpGet("user/{userId}")]
        //[Authorize(Policy = "ViewRoles")]
        public async Task<IActionResult> GetByUserId(Guid userId)
        {
            var result = await _mediator.Send(new GetRolesByUserIdQuery { UserId = userId });
            return result.ToActionResult();
        }

        /// <summary>
        /// Gán vai trò cho người dùng
        /// </summary>
        [HttpPost("assign/user/{userId}")]
        //[Authorize(Policy = "AssignRole")]
        public async Task<IActionResult> AssignToUser(Guid userId, [FromBody] List<Guid> roleIds)
        {
            var result = await _mediator.Send(new AssignRoleToUserCommand
            {
                UserId = userId,
                RoleIds = roleIds
            });
            return result.ToActionResult();
        }
    }
}

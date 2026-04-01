using Ecommerce.Application.Features.Brands.Queries.GetOptionPermissions;
using Ecommerce.Application.Features.Permissions.Commands.AssignPermissionToRole;
using Ecommerce.Application.Features.Permissions.Commands.AssignPermissionToUser;
using Ecommerce.Application.Features.Permissions.Commands.CreatePermission;
using Ecommerce.Application.Features.Permissions.Commands.DeletePermission;
using Ecommerce.Application.Features.Permissions.Commands.UpdatePermission;
using Ecommerce.Application.Features.Permissions.Queries.GetAllPermissions;
using Ecommerce.Application.Features.Permissions.Queries.GetPermissionById;
using Ecommerce.Application.Features.Permissions.Queries.GetPermissions;
using Ecommerce.Application.Features.Permissions.Queries.GetPermissionsByRoleId;
using Ecommerce.Application.Features.Permissions.Queries.GetPermissionsByUserId;
using Ecommerce.Domain.Enums;
using Ecommerce.WebAPI.Extensions;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Ecommerce.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PermissionsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public PermissionsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>
        /// Lấy danh sách tất cả các quyền
        /// </summary>
        [HttpGet("paged")]
        [Authorize(Policy = EPermissions.ViewPermissions)]
        public async Task<IActionResult> GetAll([FromQuery] GetPermissionsQuery query)
        {
            var result = await _mediator.Send(query);
            return result.ToActionResult();
        }

        /// <summary>
        /// Lấy danh sách tất cả các quyền
        /// </summary>
        [HttpGet]
        [Authorize(Policy = EPermissions.ViewPermissions)]
        public async Task<IActionResult> GetAllPermission()
        {
            var result = await _mediator.Send(new GetAllPermissionsQuery());
            return result.ToActionResult();
        }

        [HttpGet("options")]
        [Authorize(Policy = EPermissions.ViewPermissions)]
        public async Task<IActionResult> GetOptionPermissions()
        {
            var result = await _mediator.Send(new GetOptionPermissionsQuery());
            return result.ToActionResult();
        }

        /// <summary>
        /// Lấy thông tin của một quyền theo ID
        /// </summary>
        [HttpGet("{id}")]
        [Authorize(Policy = EPermissions.ViewPermissions)]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _mediator.Send(new GetPermissionByIdQuery { Id = id });
            return result.ToActionResult();
        }

        /// <summary>
        /// Thêm mới một quyền
        /// </summary>
        [HttpPost]
        [Authorize(Policy = EPermissions.CreatePermission)]
        public async Task<IActionResult> Create([FromBody] CreatePermissionCommand command)
        {
            var result = await _mediator.Send(command);
            return result.IsSuccess ?
                CreatedAtAction(nameof(GetById), new { id = result.Value }, result.Value)
                : result.ToActionResult();
        }

        /// <summary>
        /// Cập nhật thông tin của một quyền
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Policy = EPermissions.EditPermission)]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdatePermissionCommand command)
        {
            if (id != command.Id)
                return BadRequest("ID không hợp lệ.");

            var result = await _mediator.Send(command);
            return result.ToActionResult();
        }

        /// <summary>
        /// Xóa một quyền theo ID
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Policy = EPermissions.DeletePermission)]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await _mediator.Send(new DeletePermissionCommand { Id = id });
            return result.ToActionResult();
        }

        /// <summary>
        /// Lấy danh sách quyền của người dùng
        /// </summary>
        [HttpGet("user/{userId}")]
        [Authorize(Policy = EPermissions.ViewPermissions)]
        public async Task<IActionResult> GetByUserId(Guid userId)
        {
            var result = await _mediator.Send(new GetPermissionsByUserIdQuery { UserId = userId });
            return result.ToActionResult();
        }

        /// <summary>
        /// Lấy danh sách quyền của vai trò
        /// </summary>
        [HttpGet("role/{roleId}")]
        [Authorize(Policy = EPermissions.ViewPermissions)]
        public async Task<IActionResult> GetByRoleId(Guid roleId)
        {
            var result = await _mediator.Send(new GetPermissionsByRoleIdQuery { RoleId = roleId });
            return result.ToActionResult();
        }

        /// <summary>
        /// Gán quyền cho người dùng
        /// </summary>
        [HttpPost("assign/user/{userId}")]
        [Authorize(Policy = EPermissions.AssignPermission)]
        public async Task<IActionResult> AssignToUser(Guid userId, [FromBody] List<Guid> permissionIds)
        {
            var result = await _mediator.Send(new AssignPermissionToUserCommand
            {
                UserId = userId,
                PermissionIds = permissionIds
            });
            return result.ToActionResult();
        }

        /// <summary>
        /// Gán quyền cho vai trò
        /// </summary>
        [HttpPost("assign/role/{roleId}")]
        [Authorize(Policy = EPermissions.AssignPermission)]
        public async Task<IActionResult> AssignToRole(Guid roleId, [FromBody] List<Guid> permissionIds)
        {
            var result = await _mediator.Send(new AssignPermissionToRoleCommand
            {
                RoleId = roleId,
                PermissionIds = permissionIds
            });
            return result.ToActionResult();
        }
    }
}

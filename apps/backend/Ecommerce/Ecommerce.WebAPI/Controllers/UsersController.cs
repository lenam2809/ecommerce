using Ecommerce.Application.Features.Brands.Queries.GetOptionUsers;
using Ecommerce.Application.Features.Orders.Queries.GetOrdersByUser;
using Ecommerce.Application.Features.Users.Commands.CreateUser;
using Ecommerce.Application.Features.Users.Commands.DeleteUser;
using Ecommerce.Application.Features.Users.Commands.UpdateUser;
using Ecommerce.Application.Features.Users.Queries.GetPagedUsers;
using Ecommerce.Application.Features.Users.Queries.GetTopUsers;
using Ecommerce.Application.Features.Users.Queries.GetUserById;
using Ecommerce.Application.Features.Users.Queries.GetUsers;
using Ecommerce.Domain.Enums;
using Ecommerce.WebAPI.Extensions;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Ecommerce.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly IMediator _mediator;

        public UsersController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("check-claims")]
        public IActionResult CheckClaims()
        {
            var claims = User.Claims.Select(c => new { c.Type, c.Value }).ToList();
            return Ok(claims);
        }

        [HttpGet]
        [Authorize(Policy = "ViewUsers")]
        public async Task<IActionResult> GetAll([FromQuery] GetUsersQuery query)
        {
            var result = await _mediator.Send(query);
            return result.ToActionResult();
        }

        [HttpGet("paged")]
        public async Task<IActionResult> GetPaged([FromQuery] GetPagedUsersQuery query)
        {
            var result = await _mediator.Send(query);
            return result.ToActionResult();
        }

        [HttpGet("top")]
        public async Task<IActionResult> GetTopUsers([FromQuery] GetTopUsersQuery query)
        {
            var result = await _mediator.Send(query);
            return result.ToActionResult();
        }

        [HttpGet("{id}")]
        [Authorize(Policy = "ViewUsers")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _mediator.Send(new GetUserByIdQuery { Id = id });
            return result.ToActionResult();
        }

        [HttpGet("options")]
        public async Task<IActionResult> GetOptionUsers()
        {
            var result = await _mediator.Send(new GetOptionUsersQuery());
            return result.ToActionResult();
        }


        [HttpGet("orders-by-user/{userId}")]
        [Authorize(Roles = EUserRoles.Admin)]
        public async Task<IActionResult> GetOrdersByUser(Guid userId)
        {
            var query = new GetOrdersByUserQuery { UserId = userId };
            var result = await _mediator.Send(query);
            return result.ToActionResult();
        }

        [HttpPost]
        [Authorize(Roles = EUserRoles.Admin)]
        [Authorize(Policy = "CreateUser")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Create([FromForm] CreateUserCommand command)
        {
            var result = await _mediator.Send(command);
            if (result.IsSuccess)
            {
                return CreatedAtAction(nameof(GetById), new { id = result.Value }, result.Value);
            }
            return result.ToActionResult();
        }

        [HttpPut("{id}")]
        [Authorize(Policy = "EditUser")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Update(Guid id, [FromForm] UpdateUserCommand command)
        {
            if (id != command.Id)
            {
                return BadRequest("ID mismatch");
            }

            var result = await _mediator.Send(command);
            return result.ToActionResult();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = EUserRoles.Admin)]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await _mediator.Send(new DeleteUserCommand { Id = id });
            return result.ToActionResult();
        }
    }
}


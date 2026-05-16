using Ecommerce.Application.Features.CustomerAddresses.Commands.CreateCustomerAddress;
using Ecommerce.Application.Features.CustomerAddresses.Commands.DeleteCustomerAddress;
using Ecommerce.Application.Features.CustomerAddresses.Commands.UpdateCustomerAddress;
using Ecommerce.Application.Features.CustomerAddresses.Queries.GetCustomerAddressById;
using Ecommerce.Application.Features.CustomerAddresses.Queries.GetCustomerAddresses;
using Ecommerce.Application.Features.CustomerAddresses.Queries.SetDefaultAddress;
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
    public class AddressesController : ControllerBase
    {
        private readonly IMediator _mediator;

        public AddressesController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>
        /// Lấy danh sách địa chỉ của người dùng hiện tại
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetMyAddresses()
        {
            var userId = GetCurrentUserId();
            var query = new GetCustomerAddressesQuery { ApplicationUserId = userId };
            var result = await _mediator.Send(query);
            return result.ToActionResult();
        }

        /// <summary>
        /// Lấy thông tin chi tiết một địa chỉ theo ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var userId = GetCurrentUserId();
            var query = new GetCustomerAddressByIdQuery
            {
                Id = id,
                ApplicationUserId = userId
            };
            var result = await _mediator.Send(query);
            return result.ToActionResult();
        }

        /// <summary>
        /// Thêm mới địa chỉ
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateCustomerAddressCommand command)
        {
            command.ApplicationUserId = GetCurrentUserId();
            var result = await _mediator.Send(command);
            return result.IsSuccess ?
                CreatedAtAction(nameof(GetById), new { id = result.Value }, result.Value)
                : result.ToActionResult();
        }

        /// <summary>
        /// Cập nhật thông tin địa chỉ
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateCustomerAddressCommand command)
        {
            if (id != command.Id)
                return BadRequest("ID không hợp lệ.");

            command.ApplicationUserId = GetCurrentUserId();
            var result = await _mediator.Send(command);
            return result.ToActionResult();
        }

        /// <summary>
        /// Xóa địa chỉ
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var userId = GetCurrentUserId();
            var command = new DeleteCustomerAddressCommand
            {
                Id = id,
                ApplicationUserId = userId
            };
            var result = await _mediator.Send(command);
            return result.ToActionResult();
        }

        /// <summary>
        /// Đặt địa chỉ làm mặc định
        /// </summary>
        [HttpPatch("{id}/set-default")]
        public async Task<IActionResult> SetDefault(Guid id)
        {
            var userId = GetCurrentUserId();
            var command = new SetDefaultAddressCommand
            {
                AddressId = id,
                ApplicationUserId = userId
            };
            var result = await _mediator.Send(command);
            return result.ToActionResult();
        }

        private Guid GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                throw new UnauthorizedAccessException("Không thể xác định người dùng hiện tại");
            }
            return userId;
        }
    }
}


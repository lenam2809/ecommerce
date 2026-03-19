using Ecommerce.Application.Features.Returns.Commands.ApproveReturn;
using Ecommerce.Application.Features.Returns.Commands.CreateReturnRequest;
using Ecommerce.Application.Features.Returns.Commands.RejectReturn;
using Ecommerce.Application.Features.Returns.Commands.UpdateReturnStatus;
using Ecommerce.Application.Features.Returns.Queries.GetReturnRequestById;
using Ecommerce.Application.Features.Returns.Queries.GetReturnRequests;
using Ecommerce.Domain.Enums;
using Ecommerce.WebAPI.Extensions;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Ecommerce.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReturnsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public ReturnsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        // ===== Customer Endpoints =====

        /// <summary>
        /// Khách hàng tạo yêu cầu đổi/trả hàng
        /// </summary>
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create([FromBody] CreateReturnRequestCommand command)
        {
            command.CustomerId = User.GetUserId();
            var result = await _mediator.Send(command);
            return result.ToActionResult();
        }

        /// <summary>
        /// Khách hàng xem đổi/trả của mình
        /// </summary>
        [HttpGet("my-returns")]
        [Authorize]
        public async Task<IActionResult> GetMyReturns()
        {
            var userId = User.GetUserId();
            var query = new GetReturnRequestsQuery { CustomerId = userId };
            var result = await _mediator.Send(query);
            return result.ToActionResult();
        }

        /// <summary>
        /// Xem chi tiết yêu cầu đổi/trả
        /// </summary>
        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetById(Guid id)
        {
            var query = new GetReturnRequestByIdQuery { Id = id };
            var result = await _mediator.Send(query);
            return result.ToActionResult();
        }

        // ===== Admin Endpoints =====

        /// <summary>
        /// Admin: Lấy tất cả yêu cầu đổi/trả (filter theo status)
        /// </summary>
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAll([FromQuery] EReturnStatus? status)
        {
            var query = new GetReturnRequestsQuery { Status = status };
            var result = await _mediator.Send(query);
            return result.ToActionResult();
        }

        /// <summary>
        /// Admin: Lấy đổi/trả theo đơn hàng
        /// </summary>
        [HttpGet("order/{orderId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetByOrder(Guid orderId)
        {
            var query = new GetReturnRequestsQuery { OrderId = orderId };
            var result = await _mediator.Send(query);
            return result.ToActionResult();
        }

        /// <summary>
        /// Admin: Duyệt yêu cầu đổi/trả
        /// </summary>
        [HttpPut("{id}/approve")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Approve(Guid id, [FromBody] ApproveReturnCommand command)
        {
            command.ReturnRequestId = id;
            command.StaffId = User.GetUserId();
            var result = await _mediator.Send(command);
            return result.ToActionResult();
        }

        /// <summary>
        /// Admin: Từ chối yêu cầu đổi/trả
        /// </summary>
        [HttpPut("{id}/reject")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Reject(Guid id, [FromBody] RejectReturnCommand command)
        {
            command.ReturnRequestId = id;
            command.StaffId = User.GetUserId();
            var result = await _mediator.Send(command);
            return result.ToActionResult();
        }

        /// <summary>
        /// Admin: Cập nhật trạng thái RMA (ItemReceived → QualityCheck → Processing → Completed)
        /// </summary>
        [HttpPut("{id}/status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateReturnStatusCommand command)
        {
            command.ReturnRequestId = id;
            var result = await _mediator.Send(command);
            return result.ToActionResult();
        }
    }
}

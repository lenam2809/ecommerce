using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Orders.Commands.CreateOrder;
using Ecommerce.Application.Features.Orders.Commands.DeleteOrder;
using Ecommerce.Application.Features.Orders.Commands.SendOrderEmail;
using Ecommerce.Application.Features.Orders.Commands.UpdateOrder;
using Ecommerce.Application.Features.Orders.Commands.UpdateOrderStatus;
using Ecommerce.Application.Features.Orders.Queries.GetOrderById;
using Ecommerce.Application.Features.Orders.Queries.GetOrderHistory;
using Ecommerce.Application.Features.Orders.Queries.GetMyOrderHistoryStats;
using Ecommerce.Application.Features.Orders.Queries.GetOrderHistoryOverview;
using Ecommerce.Application.Features.Orders.Queries.GetOrders;
using Ecommerce.Application.Features.Orders.Queries.GetOrdersByUser;
using Ecommerce.Domain.Enums;
using Ecommerce.WebAPI.Extensions;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Ecommerce.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrdersController : ControllerBase
    {
        private readonly IMediator _mediator;

        public OrdersController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("paged")]
        [Authorize(Policy = EPermissions.ViewOrders)]
        public async Task<IActionResult> GetPaged([FromQuery] GetOrdersQuery query)
        {
            var result = await _mediator.Send(query);
            return result.ToActionResult();
        }

        [HttpGet("my-orders")]
        [Authorize]
        public async Task<IActionResult> GetMyOrders()
        {
            var userId = User.GetUserId();
            var query = new GetOrdersByUserQuery { UserId = userId };
            var result = await _mediator.Send(query);
            return result.ToActionResult();
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetById(Guid id)
        {
            var query = new GetOrderByIdQuery { Id = id };
            var result = await _mediator.Send(query);

            // Check if the order belongs to the current user or user has admin rights
            if (result.IsSuccess && !User.IsInRole("Admin") && result.Value.ApplicationUserId != User.GetUserId())
            {
                return Forbid();
            }

            return result.ToActionResult();
        }

        [HttpGet("{id}/history")]
        [Authorize]
        public async Task<IActionResult> GetOrderHistory(Guid id, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 20)
        {
            // Kiểm tra quyền truy cập đơn hàng trước
            var orderQuery = new GetOrderByIdQuery { Id = id };
            var orderResult = await _mediator.Send(orderQuery);

            if (!orderResult.IsSuccess)
            {
                return orderResult.ToActionResult();
            }

            // Check if the order belongs to the current user or user has admin rights
            if (!User.IsInRole("Admin") && orderResult.Value.ApplicationUserId != User.GetUserId())
            {
                return Forbid();
            }

            var historyQuery = new GetOrderHistoryQuery
            {
                OrderId = id,
                PageNumber = pageNumber,
                PageSize = pageSize
            };

            var result = await _mediator.Send(historyQuery);
            return result.ToActionResult();
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateOrderCommand command)
        {
            // Set the user ID from the authenticated user if logged in
            if (User.Identity?.IsAuthenticated == true)
            {
                command.ApplicationUserId = command.ApplicationUserId ?? User.GetUserId();
            }

            var result = await _mediator.Send(command);

            return result.ToActionResult();
        }

        [HttpPut("{id}")]
        [Authorize(Policy = EPermissions.EditOrder)]
        public async Task<IActionResult> Update(Guid id, UpdateOrderCommand command)
        {
            if (id != command.Id)
                return Result<Unit>.BadRequest("ID in URL must match ID in body").ToActionResult();
            var result = await _mediator.Send(command);
            return result.IsSuccess ? NoContent() : result.ToActionResult();
        }

        [HttpPut("{id}/status")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateOrderStatusCommand command)
        {
            command.Id = id;
            var result = await _mediator.Send(command);
            return result.ToActionResult();
        }

        [HttpPost("{id}/send-email")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> SendOrderEmail(Guid id)
        {
            var result = await _mediator.Send(new SendOrderEmailCommand(id));
            return result.ToActionResult();
        }

        [HttpDelete("{id}")]
        [Authorize(Policy = EPermissions.DeleteOrder)]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await _mediator.Send(new DeleteOrderCommand { Id = id });
            return result.ToActionResult();
        }

        /// <summary>
        /// Lấy thống kê lịch sử đơn hàng của user hiện tại
        /// </summary>
        [HttpGet("my-orders/history-stats")]
        [Authorize]
        public async Task<IActionResult> GetMyOrderHistoryStats()
        {
            var result = await _mediator.Send(new GetMyOrderHistoryStatsQuery
            {
                UserId = User.GetUserId()
            });

            return result.ToActionResult();
        }

        /// <summary>
        /// Admin endpoint: Lấy thống kê tổng quan lịch sử đơn hàng
        /// </summary>
        [HttpGet("history-overview")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> GetOrderHistoryOverview([FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate)
        {
            var result = await _mediator.Send(new GetOrderHistoryOverviewQuery
            {
                FromDate = fromDate,
                ToDate = toDate
            });

            return result.ToActionResult();
        }
    }
}

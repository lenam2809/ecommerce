using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Orders.Commands.CreateOrder;
using Ecommerce.Application.Features.Orders.Commands.DeleteOrder;
using Ecommerce.Application.Features.Orders.Commands.UpdateOrder;
using Ecommerce.Application.Features.Orders.Commands.UpdateOrderStatus;
using Ecommerce.Application.Features.Orders.Queries.GetOrderById;
using Ecommerce.Application.Features.Orders.Queries.GetOrderHistory;
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
            var userId = User.GetUserId();

            // Lấy tất cả đơn hàng của user
            var ordersQuery = new GetOrdersByUserQuery { UserId = userId };
            var ordersResult = await _mediator.Send(ordersQuery);

            if (!ordersResult.IsSuccess)
            {
                return ordersResult.ToActionResult();
            }

            var orders = ordersResult.Value;
            var stats = new
            {
                TotalOrders = orders.Count,
                StatusBreakdown = orders.GroupBy(o => o.Status)
                    .ToDictionary(g => g.Key, g => g.Count()),
                MonthlyOrderCount = orders.GroupBy(o => new { o.OrderDate.Year, o.OrderDate.Month })
                    .Select(g => new
                    {
                        Period = $"{g.Key.Year}-{g.Key.Month:D2}",
                        Count = g.Count(),
                        TotalAmount = g.Sum(o => o.TotalAmount)
                    })
                    .OrderBy(x => x.Period)
                    .ToList(),
                TotalSpent = orders.Sum(o => o.TotalAmount),
                AverageOrderValue = orders.Any() ? orders.Average(o => o.TotalAmount) : 0
            };

            return Ok(Result<object>.Success(stats));
        }

        /// <summary>
        /// Admin endpoint: Lấy thống kê tổng quan lịch sử đơn hàng
        /// </summary>
        [HttpGet("history-overview")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> GetOrderHistoryOverview([FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate)
        {
            var query = new GetOrdersQuery
            {
                PageNumber = 1,
                PageSize = int.MaxValue
            };

            var result = await _mediator.Send(query);

            if (!result.IsSuccess)
            {
                return result.ToActionResult();
            }

            var orders = result.Value.Items;

            // Filter by date range if provided
            if (fromDate.HasValue)
            {
                orders = (List<Application.Features.Orders.Dto.OrderDto>)orders.Where(o => o.OrderDate >= fromDate.Value);
            }
            if (toDate.HasValue)
            {
                orders = (List<Application.Features.Orders.Dto.OrderDto>)orders.Where(o => o.OrderDate <= toDate.Value);
            }

            var overview = new
            {
                Period = new { From = fromDate, To = toDate },
                Summary = new
                {
                    TotalOrders = orders.Count(),
                    TotalRevenue = orders.Sum(o => o.TotalAmount),
                    AverageOrderValue = orders.Any() ? orders.Average(o => o.TotalAmount) : 0
                },
                StatusDistribution = orders.GroupBy(o => o.Status)
                    .Select(g => new { Status = g.Key, Count = g.Count(), Percentage = (double)g.Count() / orders.Count() * 100 })
                    .ToList(),
                DailyTrends = orders.GroupBy(o => o.OrderDate.Date)
                    .Select(g => new
                    {
                        Date = g.Key,
                        OrderCount = g.Count(),
                        Revenue = g.Sum(o => o.TotalAmount)
                    })
                    .OrderBy(x => x.Date)
                    .ToList()
            };

            return Ok(Result<object>.Success(overview));
        }
    }
}

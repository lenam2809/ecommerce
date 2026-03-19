using Ecommerce.Application.Features.Dashboard.Queries.GetCustomersByDate;
using Ecommerce.Application.Features.Dashboard.Queries.GetDashboardKpis;
using Ecommerce.Application.Features.Dashboard.Queries.GetOrdersByDate;
using Ecommerce.Application.Features.Dashboard.Queries.GetProductsByDate;
using Ecommerce.Application.Features.Dashboard.Queries.GetRevenueByDate;
using Ecommerce.Application.Features.Dashboard.Queries.GetTopSellingProducts;
using Ecommerce.Application.Features.Orders.Queries.GetOrderAnalytics;
using Ecommerce.WebAPI.Extensions;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Ecommerce.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    //[Authorize(Policy = "Admin")]
    public class DashboardController : ControllerBase
    {
        private readonly IMediator _mediator;

        public DashboardController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("order-analytics")]
        public async Task<IActionResult> GetOrderAnalytics([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {
            var query = new GetOrderAnalyticsQuery
            {
                StartDate = startDate,
                EndDate = endDate
            };

            var result = await _mediator.Send(query);
            return result.ToActionResult();
        }

        [HttpGet("kpis")]
        public async Task<IActionResult> GetKpis() =>
            (await _mediator.Send(new GetDashboardKpisQuery())).ToActionResult();

        [HttpGet("top-products")]
        public async Task<IActionResult> GetTopProducts([FromQuery] int top = 5) =>
            (await _mediator.Send(new GetTopSellingProductsQuery { Top = top })).ToActionResult();

        [HttpGet("revenue-by-date")]
        public async Task<IActionResult> GetRevenueByDate([FromQuery] int days = 30) =>
            (await _mediator.Send(new GetRevenueByDateQuery { Days = days })).ToActionResult();

        [HttpGet("customers-by-date")]
        public async Task<IActionResult> GetCustomersByDate([FromQuery] int days = 30) =>
            (await _mediator.Send(new GetCustomersByDateQuery { Days = days })).ToActionResult();

        [HttpGet("orders-by-date")]
        public async Task<IActionResult> GetOrdersByDate([FromQuery] int days = 30) =>
            (await _mediator.Send(new GetOrdersByDateQuery { Days = days })).ToActionResult();

        [HttpGet("products-by-date")]
        public async Task<IActionResult> GetProductsByDate([FromQuery] int days = 30) =>
            (await _mediator.Send(new GetProductsByDateQuery { Days = days })).ToActionResult();
    }
}


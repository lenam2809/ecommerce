using Ecommerce.Application.Features.Reports.Queries.GetAverageOrderValue;
using Ecommerce.Application.Features.Reports.Queries.GetLowStockProducts;
using Ecommerce.Application.Features.Reports.Queries.GetOrderOverview;
using Ecommerce.Application.Features.Reports.Queries.GetOrderRatio;
using Ecommerce.Application.Features.Reports.Queries.GetOrderStatus;
using Ecommerce.Application.Features.Reports.Queries.GetProductPerformance;
using Ecommerce.Application.Features.Reports.Queries.GetProductReturnRate;
using Ecommerce.Application.Features.Reports.Queries.GetProductsByCategory;
using Ecommerce.Application.Features.Reports.Queries.GetRecentOrders;
using Ecommerce.Application.Features.Reports.Queries.GetRecentTransactions;
using Ecommerce.Application.Features.Reports.Queries.GetRevenueByCategory;
using Ecommerce.Application.Features.Reports.Queries.GetRevenueByMonth;
using Ecommerce.Application.Features.Reports.Queries.GetRevenueComparison;
using Ecommerce.Application.Features.Reports.Queries.GetRevenueOverview;
using Ecommerce.Application.Features.Reports.Queries.GetRevenueTrend;
using Ecommerce.Application.Features.Reports.Queries.GetTopProducts;
using Ecommerce.Application.Features.Reports.Queries.GetTopUsers;
using Ecommerce.Application.Features.Reports.Queries.GetUserActivity;
using Ecommerce.Application.Features.Reports.Queries.GetUserSegmentation;
using Ecommerce.WebAPI.Extensions;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Ecommerce.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReportsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public ReportsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        #region Revenue Reports

        [HttpGet("revenue-overview")]
        public async Task<IActionResult> GetRevenueOverview([FromQuery] GetRevenueOverviewQuery query)
        {
            var result = await _mediator.Send(query);
            return result.ToActionResult();
        }

        [HttpGet("recent-transactions")]
        public async Task<IActionResult> GetRecentTransactions([FromQuery] GetRecentTransactionsQuery query)
        {
            var result = await _mediator.Send(query);
            return result.ToActionResult();
        }

        [HttpGet("revenue-by-category")]
        public async Task<IActionResult> GetRevenueByCategory([FromQuery] GetRevenueByCategoryQuery query)
        {
            var result = await _mediator.Send(query);
            return result.ToActionResult();
        }

        [HttpGet("revenue-by-month")]
        public async Task<IActionResult> GetRevenueByMonth([FromQuery] GetRevenueByMonthQuery query)
        {
            var result = await _mediator.Send(query);
            return result.ToActionResult();
        }

        [HttpGet("revenue-comparison")]
        public async Task<IActionResult> GetRevenueComparison([FromQuery] GetRevenueComparisonQuery query)
        {
            var result = await _mediator.Send(query);
            return result.ToActionResult();
        }

        [HttpGet("revenue-trend")]
        public async Task<IActionResult> GetRevenueTrend([FromQuery] GetRevenueTrendQuery query)
        {
            var result = await _mediator.Send(query);
            return result.ToActionResult();
        }

        #endregion

        #region Order Reports

        [HttpGet("order-overview")]
        public async Task<IActionResult> GetOrderOverview([FromQuery] GetOrderOverviewQuery query)
        {
            var result = await _mediator.Send(query);
            return result.ToActionResult();
        }

        [HttpGet("recent-orders")]
        public async Task<IActionResult> GetRecentOrders([FromQuery] GetRecentOrdersQuery query)
        {
            var result = await _mediator.Send(query);
            return result.ToActionResult();
        }

        [HttpGet("order-status")]
        public async Task<IActionResult> GetOrderStatus([FromQuery] GetOrderStatusQuery query)
        {
            var result = await _mediator.Send(query);
            return result.ToActionResult();
        }

        [HttpGet("order-ratio")]
        public async Task<IActionResult> GetOrderRatio([FromQuery] GetOrderRatioQuery query)
        {
            var result = await _mediator.Send(query);
            return result.ToActionResult();
        }

        [HttpGet("average-order-value")]
        public async Task<IActionResult> GetAverageOrderValue([FromQuery] GetAverageOrderValueQuery query)
        {
            var result = await _mediator.Send(query);
            return result.ToActionResult();
        }

        #endregion

        #region Product Reports
        [HttpGet("top-products")]
        public async Task<IActionResult> GetTopProducts([FromQuery] GetTopProductsQuery query)
        {
            var result = await _mediator.Send(query);
            return result.ToActionResult();
        }

        [HttpGet("low-stock-products")]
        public async Task<IActionResult> GetLowStockProducts([FromQuery] GetLowStockProductsQuery query)
        {
            var result = await _mediator.Send(query);
            return result.ToActionResult();
        }

        [HttpGet("product-return-rate")]
        public async Task<IActionResult> GetProductReturnRate([FromQuery] GetProductReturnRateQuery query)
        {
            var result = await _mediator.Send(query);
            return result.ToActionResult();
        }

        [HttpGet("products-by-category")]
        public async Task<IActionResult> GetProductsByCategory([FromQuery] GetProductsByCategoryQuery query)
        {
            var result = await _mediator.Send(query);
            return result.ToActionResult();
        }

        [HttpGet("product-performance")]
        public async Task<IActionResult> GetProductPerformance([FromQuery] GetProductPerformanceQuery query)
        {
            var result = await _mediator.Send(query);
            return result.ToActionResult();
        }
        #endregion

        #region User Reports
        [HttpGet("top-users")]
        public async Task<IActionResult> GetTopUsers([FromQuery] GetTopUsersQuery query)
        {
            var result = await _mediator.Send(query);
            return result.ToActionResult();
        }

        [HttpGet("user-activity")]
        public async Task<IActionResult> GetUserActivity([FromQuery] GetUserActivityQuery query)
        {
            var result = await _mediator.Send(query);
            return result.ToActionResult();
        }

        [HttpGet("user-segmentation")]
        public async Task<IActionResult> GetUserSegmentation([FromQuery] GetUserSegmentationQuery query)
        {
            var result = await _mediator.Send(query);
            return result.ToActionResult();
        }
        #endregion
    }
}


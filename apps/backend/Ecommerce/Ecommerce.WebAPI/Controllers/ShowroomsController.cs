using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Showrooms.Dto;
using Ecommerce.Application.Features.Showrooms.Queries.CheckShowroomStock;
using Ecommerce.Application.Features.Showrooms.Queries.GetShowrooms;
using Ecommerce.WebAPI.Extensions;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Ecommerce.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ShowroomsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public ShowroomsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>
        /// Lấy danh sách hệ thống 45 showroom toàn quốc (hỗ trợ filter theo province)
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string? province)
        {
            var result = await _mediator.Send(new GetShowroomsQuery { Province = province });
            return result.ToActionResult();
        }

        /// <summary>
        /// Kiểm tra số lượng tồn kho của một sản phẩm tại từng cơ sở showroom
        /// </summary>
        [HttpGet("check-stock")]
        public async Task<IActionResult> CheckStock([FromQuery] Guid productId, [FromQuery] Guid? skuId)
        {
            var result = await _mediator.Send(new CheckShowroomStockQuery
            {
                ProductId = productId,
                ProductVariantSkuId = skuId
            });
            return result.ToActionResult();
        }
    }
}

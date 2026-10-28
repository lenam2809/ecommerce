using System;
using System.Threading.Tasks;
using Ecommerce.Application.Features.Promotions.Commands.CreateFlashSale;
using Ecommerce.Application.Features.Promotions.Commands.DeleteFlashSale;
using Ecommerce.Application.Features.Promotions.Commands.UpdateFlashSale;
using Ecommerce.Application.Features.Promotions.Queries.GetCurrentFlashSale;
using Ecommerce.Application.Features.Promotions.Queries.GetFlashSaleById;
using Ecommerce.Application.Features.Promotions.Queries.GetFlashSales;
using Ecommerce.Domain.Enums;
using Ecommerce.WebAPI.Extensions;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Ecommerce.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PromotionsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public PromotionsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>
        /// Lấy thông tin chương trình Flash Sale đang hoạt động (kèm danh sách sản phẩm, giá khuyến mãi và đếm ngược)
        /// </summary>
        [HttpGet("flash-sale/current")]
        public async Task<IActionResult> GetCurrentFlashSale()
        {
            var result = await _mediator.Send(new GetCurrentFlashSaleQuery());
            return result.ToActionResult();
        }

        /// <summary>
        /// Danh sách các chiến dịch Flash Sale
        /// </summary>
        [HttpGet("flash-sales")]
        [Authorize(Policy = EPermissions.EditPromotion)]
        public async Task<IActionResult> GetFlashSales([FromQuery] bool? isActive)
        {
            var result = await _mediator.Send(new GetFlashSalesQuery { IsActive = isActive });
            return result.ToActionResult();
        }

        /// <summary>
        /// Chi tiết 1 chiến dịch Flash Sale kèm danh sách Items
        /// </summary>
        [HttpGet("flash-sales/{id}")]
        [Authorize(Policy = EPermissions.EditPromotion)]
        public async Task<IActionResult> GetFlashSaleById(Guid id)
        {
            var result = await _mediator.Send(new GetFlashSaleByIdQuery { Id = id });
            return result.ToActionResult();
        }

        /// <summary>
        /// Tạo mới chiến dịch Flash Sale & FlashSaleItems
        /// </summary>
        [HttpPost("flash-sales")]
        [Authorize(Policy = EPermissions.EditPromotion)]
        public async Task<IActionResult> CreateFlashSale([FromBody] CreateFlashSaleCommand command)
        {
            var result = await _mediator.Send(command);
            return result.ToActionResult();
        }

        /// <summary>
        /// Cập nhật chiến dịch Flash Sale & danh sách FlashSaleItems
        /// </summary>
        [HttpPut("flash-sales/{id}")]
        [Authorize(Policy = EPermissions.EditPromotion)]
        public async Task<IActionResult> UpdateFlashSale(Guid id, [FromBody] UpdateFlashSaleCommand command)
        {
            command.Id = id;
            var result = await _mediator.Send(command);
            return result.ToActionResult();
        }

        /// <summary>
        /// Xóa chiến dịch Flash Sale
        /// </summary>
        [HttpDelete("flash-sales/{id}")]
        [Authorize(Policy = EPermissions.EditPromotion)]
        public async Task<IActionResult> DeleteFlashSale(Guid id)
        {
            var result = await _mediator.Send(new DeleteFlashSaleCommand { Id = id });
            return result.ToActionResult();
        }
    }
}

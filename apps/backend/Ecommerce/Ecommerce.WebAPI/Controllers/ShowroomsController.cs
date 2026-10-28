using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Showrooms.Commands.CreateShowroom;
using Ecommerce.Application.Features.Showrooms.Commands.DeleteShowroom;
using Ecommerce.Application.Features.Showrooms.Commands.TransferShowroomStock;
using Ecommerce.Application.Features.Showrooms.Commands.UpdateShowroom;
using Ecommerce.Application.Features.Showrooms.Commands.UpdateShowroomInventory;
using Ecommerce.Application.Features.Showrooms.Dto;
using Ecommerce.Application.Features.Showrooms.Queries.CheckShowroomStock;
using Ecommerce.Application.Features.Showrooms.Queries.GetAdminShowrooms;
using Ecommerce.Application.Features.Showrooms.Queries.GetShowroomInventory;
using Ecommerce.Application.Features.Showrooms.Queries.GetShowrooms;
using Ecommerce.Domain.Enums;
using Ecommerce.WebAPI.Extensions;
using MediatR;
using Microsoft.AspNetCore.Authorization;
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

        /// <summary>
        /// Lấy toàn bộ danh sách Showroom quản trị (cả active & inactive), kèm tổng SKU có hàng và tổng tồn kho
        /// </summary>
        [HttpGet("admin")]
        [Authorize(Policy = EPermissions.ViewShowrooms)]
        public async Task<IActionResult> GetAdminShowrooms(
            [FromQuery] string? region,
            [FromQuery] string? search,
            [FromQuery] bool? isActive)
        {
            var result = await _mediator.Send(new GetAdminShowroomsQuery
            {
                Region = region,
                Search = search,
                IsActive = isActive
            });
            return result.ToActionResult();
        }

        /// <summary>
        /// Tạo showroom mới trong hệ thống
        /// </summary>
        [HttpPost]
        [Authorize(Policy = EPermissions.ManageShowrooms)]
        public async Task<IActionResult> CreateShowroom([FromBody] CreateShowroomCommand command)
        {
            var result = await _mediator.Send(command);
            return result.ToActionResult();
        }

        /// <summary>
        /// Cập nhật thông tin showroom
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Policy = EPermissions.ManageShowrooms)]
        public async Task<IActionResult> UpdateShowroom(Guid id, [FromBody] UpdateShowroomCommand command)
        {
            if (id != command.Id)
            {
                return BadRequest(new { Success = false, Error = "Id trong URL không khớp với body dữ liệu" });
            }

            var result = await _mediator.Send(command);
            return result.ToActionResult();
        }

        /// <summary>
        /// Xóa mềm showroom (đánh dấu IsActive = false)
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Policy = EPermissions.ManageShowrooms)]
        public async Task<IActionResult> DeleteShowroom(Guid id)
        {
            var result = await _mediator.Send(new DeleteShowroomCommand { Id = id });
            return result.ToActionResult();
        }

        /// <summary>
        /// Truy vấn tồn kho ShowroomInventory tại cơ sở showroom
        /// </summary>
        [HttpGet("{id}/inventory")]
        [Authorize(Policy = EPermissions.ViewShowrooms)]
        public async Task<IActionResult> GetInventory(Guid id, [FromQuery] string? search)
        {
            var result = await _mediator.Send(new GetShowroomInventoryQuery
            {
                ShowroomId = id,
                Search = search
            });
            return result.ToActionResult();
        }

        /// <summary>
        /// Cập nhật nhanh số lượng tồn kho và cờ giao hỏa tốc 2H cho SKU tại cơ sở showroom
        /// </summary>
        [HttpPut("{id}/inventory")]
        [Authorize(Policy = EPermissions.ManageInventory)]
        public async Task<IActionResult> UpdateInventory(Guid id, [FromBody] UpdateShowroomInventoryCommand command)
        {
            if (id != command.ShowroomId)
            {
                return BadRequest(new { Success = false, Error = "ShowroomId trong URL không khớp với body dữ liệu" });
            }

            var result = await _mediator.Send(command);
            return result.ToActionResult();
        }

        /// <summary>
        /// Điều chuyển tồn kho SKU giữa 2 cơ sở showroom trong một Transaction an toàn
        /// </summary>
        [HttpPost("transfer-stock")]
        [Authorize(Policy = EPermissions.ManageInventory)]
        public async Task<IActionResult> TransferStock([FromBody] TransferShowroomStockCommand command)
        {
            var result = await _mediator.Send(command);
            return result.ToActionResult();
        }
    }
}

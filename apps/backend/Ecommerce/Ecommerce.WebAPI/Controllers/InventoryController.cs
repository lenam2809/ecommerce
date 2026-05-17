using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Inventory.Commands.ImportInventoryBatch;
using Ecommerce.Application.Features.Inventory.Queries.GetInventoryBySkuId;
using Ecommerce.Domain.Enums;
using Ecommerce.WebAPI.Extensions;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Ecommerce.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = EUserRoles.Admin)]
    public class InventoryController : ControllerBase
    {
        private readonly IMediator _mediator;

        public InventoryController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>
        /// Lấy danh sách IMEI/Serial theo SKU
        /// </summary>
        [HttpGet("sku/{skuId}")]
        public async Task<IActionResult> GetBySkuId(Guid skuId)
        {
            var query = new GetInventoryBySkuIdQuery { ProductVariantSkuId = skuId };
            var result = await _mediator.Send(query);
            return result.ToActionResult();
        }

        /// <summary>
        /// Import lô IMEI/Serial Number cho một SKU
        /// </summary>
        [HttpPost("import")]
        public async Task<IActionResult> ImportBatch([FromBody] ImportInventoryBatchCommand command)
        {
            var result = await _mediator.Send(command);
            return result.ToActionResult();
        }
    }
}

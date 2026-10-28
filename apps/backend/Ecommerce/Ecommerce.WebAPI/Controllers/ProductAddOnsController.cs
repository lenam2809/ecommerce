using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Products.Commands.CreateProductAddOn;
using Ecommerce.Application.Features.Products.Commands.DeleteProductAddOn;
using Ecommerce.Application.Features.Products.Commands.UpdateProductAddOn;
using Ecommerce.Application.Features.Products.Dto;
using Ecommerce.Application.Features.Products.Queries.GetProductAddOns;
using Ecommerce.Domain.Enums;
using Ecommerce.WebAPI.Extensions;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Ecommerce.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductAddOnsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public ProductAddOnsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>
        /// Lấy danh sách gói dịch vụ mua kèm / bảo hành mở rộng (hỗ trợ lọc theo productId, categoryId, brandId, addOnType, isActive)
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] GetProductAddOnsQuery query)
        {
            var result = await _mediator.Send(query);
            return result.ToActionResult();
        }

        /// <summary>
        /// Lấy chi tiết gói dịch vụ theo ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _mediator.Send(new GetProductAddOnByIdQuery { Id = id });
            return result.ToActionResult();
        }

        /// <summary>
        /// Tạo mới gói dịch vụ mua kèm / bảo hành
        /// </summary>
        [HttpPost]
        [Authorize(Policy = EPermissions.CreateProduct)]
        public async Task<IActionResult> Create([FromBody] CreateProductAddOnCommand command)
        {
            var result = await _mediator.Send(command);
            return result.IsSuccess
                ? CreatedAtAction(nameof(GetById), new { id = result.Value }, result.Value)
                : result.ToActionResult();
        }

        /// <summary>
        /// Cập nhật thông tin gói dịch vụ
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Policy = EPermissions.EditProduct)]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateProductAddOnCommand command)
        {
            if (id != command.Id)
            {
                command.Id = id;
            }

            var result = await _mediator.Send(command);
            return result.ToActionResult();
        }

        /// <summary>
        /// Xóa gói dịch vụ theo ID
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Policy = EPermissions.DeleteProduct)]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await _mediator.Send(new DeleteProductAddOnCommand { Id = id });
            return result.ToActionResult();
        }
    }
}

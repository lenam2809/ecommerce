using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Products.Dto;
using Ecommerce.Application.Features.Products.Queries.CompareProducts;
using Ecommerce.Application.Features.Products.Queries.GetProductSpecifications;
using Ecommerce.WebAPI.Extensions;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Ecommerce.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductSpecsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public ProductSpecsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>
        /// Lấy toàn bộ thông số kỹ thuật chi tiết của một sản phẩm
        /// </summary>
        [HttpGet("product/{productId}")]
        [HttpGet("{productId:guid}")]
        public async Task<IActionResult> GetByProductId(Guid productId)
        {
            var result = await _mediator.Send(new GetProductSpecificationsQuery { ProductId = productId });
            return result.ToActionResult();
        }

        /// <summary>
        /// Ma trận so sánh nhóm thông số giữa các sản phẩm (ids=guid1,guid2,...)
        /// </summary>
        [HttpGet("compare")]
        public async Task<IActionResult> Compare([FromQuery] string ids)
        {
            var result = await _mediator.Send(new CompareProductsQuery { Ids = ids });
            return result.ToActionResult();
        }
    }
}

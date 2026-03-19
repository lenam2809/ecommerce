using Ecommerce.Application.Features.Brands.Commands.CreateBrand;
using Ecommerce.Application.Features.Brands.Commands.DeleteBrand;
using Ecommerce.Application.Features.Brands.Commands.UpdateBrand;
using Ecommerce.Application.Features.Brands.Queries.GetAllBrands;
using Ecommerce.Application.Features.Brands.Queries.GetBrandById;
using Ecommerce.Application.Features.Brands.Queries.GetBrandBySlug;
using Ecommerce.Application.Features.Brands.Queries.GetBrandsByCategoryId;
using Ecommerce.Application.Features.Brands.Queries.GetCategories;
using Ecommerce.Application.Features.Brands.Queries.GetOptionBrands;
using Ecommerce.Application.Features.CategoryBrands.Commands.CreateCategoryBrand;
using Ecommerce.WebAPI.Extensions;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Ecommerce.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BrandsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public BrandsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>
        /// Lấy danh sách tất cả các brand
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _mediator.Send(new GetAllBrandsQuery());
            return result.ToActionResult();
        }

        /// <summary>
        /// Lấy danh sách tất cả các brand theo phân trang
        /// </summary>
        [HttpGet("paged")]
        public async Task<IActionResult> GetPaged([FromQuery] GetBrandsQuery query)
        {
            var result = await _mediator.Send(query);
            return result.ToActionResult();
        }

        [HttpGet("options")]
        public async Task<IActionResult> GetOptionBrands()
        {
            var result = await _mediator.Send(new GetOptionBrandsQuery());
            return result.ToActionResult();
        }

        [HttpGet("category/{categoryId}")]
        public async Task<IActionResult> GetBrandsByCategory(Guid categoryId)
        {
            var result = await _mediator.Send(new GetBrandsByCategoryIdQuery { CategoryId = categoryId });
            return result.ToActionResult();
        }

        [HttpGet("slug/{slug}")]
        public async Task<IActionResult> GetBrandBySlug(string slug)
        {
            var result = await _mediator.Send(new GetBrandBySlugQuery { Slug = slug });

            return result.ToActionResult();
        }


        /// <summary>
        /// Lấy thông tin của một brand theo ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _mediator.Send(new GetBrandByIdQuery { Id = id });
            return result.ToActionResult();
        }

        /// <summary>
        /// Thêm mới một brand
        /// </summary>
        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Create([FromForm] CreateBrandCommand command)
        {
            var result = await _mediator.Send(command);
            return result.IsSuccess ?
                CreatedAtAction(nameof(GetById), new { id = result.Value }, result.Value)
                : result.ToActionResult();
        }

        /// <summary>
        /// Cập nhật thông tin của một brand
        /// </summary>
        [HttpPut("{id}")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Update(Guid id, [FromForm] UpdateBrandCommand command)
        {
            if (id != command.Id)
                return BadRequest("ID không hợp lệ.");

            var result = await _mediator.Send(command);
            return result.ToActionResult();
        }

        /// <summary>
        /// Xóa một brand theo ID
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await _mediator.Send(new DeleteBrandCommand { Id = id });
            return result.ToActionResult();
        }


        [HttpPost("link-category-brand")]
        public async Task<IActionResult> LinkCategoryBrand([FromBody] CreateCategoryBrandCommand command)
        {
            var result = await _mediator.Send(command);
            return Ok(result);
        }
    }
}


using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Categories.Commands.CreateCategory;
using Ecommerce.Application.Features.Categories.Commands.DeleteCategory;
using Ecommerce.Application.Features.Categories.Commands.UpdateCategory;
using Ecommerce.Application.Features.Categories.Queries.GetAllCategories;
using Ecommerce.Application.Features.Categories.Queries.GetCategories;
using Ecommerce.Application.Features.Categories.Queries.GetCategoriesByBrandId;
using Ecommerce.Application.Features.Categories.Queries.GetCategoryById;
using Ecommerce.Application.Features.Categories.Queries.GetCategoryBySlug;
using Ecommerce.Application.Features.Categories.Queries.GetOptionCategories;
using Ecommerce.Application.Features.Categories.Queries.GetTopPopularCategories;
using Ecommerce.Domain.Enums;
using Ecommerce.WebAPI.Extensions;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Ecommerce.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoriesController : ControllerBase
    {
        private readonly IMediator _mediator;

        public CategoriesController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>
        /// Lấy danh sách tất cả các category
        /// </summary>
        [HttpGet("paged")]
        [Authorize(Policy = EPermissions.ViewCategories)]
        public async Task<IActionResult> GetAll([FromQuery] GetCategoriesQuery query)
        {
            var result = await _mediator.Send(query);
            return result.ToActionResult();
        }

        /// <summary>
        /// Lấy danh sách tất cả các category
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAllCategories()
        {
            var result = await _mediator.Send(new GetAllCategoriesQuery());
            return result.ToActionResult();
        }

        [HttpGet("options")]
        public async Task<IActionResult> GetOptionCategories(bool includeChildren = false)
        {
            var query = new GetOptionCategoriesQuery { IncludeChildren = includeChildren };
            var result = await _mediator.Send(query);
            return result.ToActionResult();
        }

        [HttpGet("brand/{brandId}")]
        public async Task<IActionResult> GetCategoriesByBrand(Guid brandId)
        {
            var result = await _mediator.Send(new GetCategoriesByBrandIdQuery { BrandId = brandId });

            return result.ToActionResult();
        }

        [HttpGet("slug/{slug}")]
        public async Task<IActionResult> GetCategoryBySlug(
    string slug,
    [FromQuery] bool includeChildren = false,
    [FromQuery] bool includeBrands = false)
        {
            var result = await _mediator.Send(new GetCategoryBySlugQuery
            {
                Slug = slug,
                IncludeChildren = includeChildren,
                IncludeBrands = includeBrands
            });

            return result.ToActionResult();
        }

        /// <summary>
        /// Lấy thông tin của một category theo ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _mediator.Send(new GetCategoryByIdQuery { Id = id });
            return result.ToActionResult();
        }

        // Các endpoint hiện có

        [HttpGet("popular")]
        public async Task<IActionResult> GetTopPopularCategories([FromQuery] int limit = 3)
        {
            var query = new GetTopPopularCategoriesQuery { Limit = limit };
            var result = await _mediator.Send(query);
            return result.ToActionResult();
        }

        /// <summary>
        /// Thêm mới một category
        /// </summary>
        [HttpPost]
        [Authorize(Policy = EPermissions.CreateCategory)]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Create([FromForm] CreateCategoryCommand command)
        {
            // Validate main image
            if (command.Image == null || command.Image.Length == 0)
            {
                return Result<Guid>.BadRequest("Image is required").ToActionResult();
            }
            var result = await _mediator.Send(command);
            return result.IsSuccess
            ? CreatedAtAction(nameof(GetById), new { id = result.Value }, result.Value)
            : result.ToActionResult();
        }

        /// <summary>
        /// Cập nhật thông tin của một category
        /// </summary>

        [HttpPut("{id}")]
        [Authorize(Policy = EPermissions.EditCategory)]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Update(Guid id, [FromForm] UpdateCategoryCommand command)
        {
            if (id != command.Id)
                return Result<Guid>.BadRequest("ID in URL must match ID in body").ToActionResult();

            var result = await _mediator.Send(command);
            return result.ToActionResult();
        }

        /// <summary>
        /// Xóa một category theo ID
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Policy = EPermissions.DeleteCategory)]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await _mediator.Send(new DeleteCategoryCommand { Id = id });
            return result.ToActionResult();
        }
    }
}


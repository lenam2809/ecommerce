using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Brands.Queries.GetOptionProducts;
using Ecommerce.Application.Features.Products.Commands.CreateProduct;
using Ecommerce.Application.Features.Products.Commands.DeleteProduct;
using Ecommerce.Application.Features.Products.Commands.ExportProducts;
using Ecommerce.Application.Features.Products.Commands.ExportProductsTemplate;
using Ecommerce.Application.Features.Products.Commands.ImportProducts;
using Ecommerce.Application.Features.Products.Commands.UpdateProduct;
using Ecommerce.Application.Features.Products.Dto;
using Ecommerce.Application.Features.Products.Queries.GetBestsellingProducts;
using Ecommerce.Application.Features.Products.Queries.GetPagedProducts;
using Ecommerce.Application.Features.Products.Queries.GetProductById;
using Ecommerce.Application.Features.Products.Queries.GetProductBySlug;
using Ecommerce.Application.Features.Products.Queries.GetProductReviews;
using Ecommerce.Application.Features.Products.Queries.GetProducts;
using Ecommerce.Application.Features.Products.Queries.GetProductsByBrand;
using Ecommerce.Application.Features.Products.Queries.GetProductsByCategory;
using Ecommerce.Application.Features.Products.Queries.GetSimilarProducts;
using Ecommerce.Domain.Enums;
using Ecommerce.WebAPI.Extensions;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Ecommerce.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly IFileStorageService _fileStorageService;

        public ProductsController(IMediator mediator, IFileStorageService fileStorageService)
        {
            _mediator = mediator;
            _fileStorageService = fileStorageService;
        }

        [HttpGet("paged")]
        public async Task<IActionResult> GetPaged([FromQuery] GetPagedProductsQuery query)
        {
            var result = await _mediator.Send(query);
            return result.ToActionResult();
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _mediator.Send(new GetProductsQuery());
            return result.ToActionResult();
        }

        [HttpGet("{id}/similar")]
        public async Task<IActionResult> GetSimilarProducts(Guid id)
        {
            var query = new GetSimilarProductsQuery(id);
            var result = await _mediator.Send(query);
            return result.ToActionResult();
        }

        [HttpGet("{id}/reviews")]
        public async Task<IActionResult> GetProductReviews(Guid id)
        {
            var query = new GetProductReviewsQuery(id);
            var result = await _mediator.Send(query);
            return result.ToActionResult();
        }

        [HttpGet("featured")]
        public async Task<IActionResult> GetFeaturedProducts()
        {
            var query = new GetBestsellingProductsQuery();
            var result = await _mediator.Send(query);
            return result.ToActionResult();
        }

        [HttpGet("bestselling")]
        public async Task<IActionResult> GetBestsellingProducts()
        {
            var query = new GetBestsellingProductsQuery();
            var result = await _mediator.Send(query);
            return result.ToActionResult();
        }

        [HttpGet("slug/{slug}")]
        public async Task<IActionResult> GetBySlug(string slug)
        {
            var result = await _mediator.Send(new GetProductBySlugQuery { Slug = slug });
            return result.ToActionResult();
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _mediator.Send(new GetProductByIdQuery { Id = id });
            return result.ToActionResult();
        }

        [HttpGet("options")]
        public async Task<IActionResult> GetOptionProducts()
        {
            var result = await _mediator.Send(new GetOptionProductsQuery());
            return result.ToActionResult();
        }

        [HttpGet("products-by-category/{id}")]
        public async Task<IActionResult> GetProductsByCategory(Guid id)
        {
            var result = await _mediator.Send(new GetProductsByCategoryQuery { CategoryId = id });
            return result.ToActionResult();
        }

        [HttpGet("products-by-brand/{id}")]
        public async Task<IActionResult> GetProductsByBrand(Guid id)
        {
            var result = await _mediator.Send(new GetProductsByBrandQuery { BrandId = id });
            return result.ToActionResult();
        }

        [HttpPost]
        [Authorize(Policy = "CreateProduct")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Create([FromForm] CreateProductCommand command)
        {
            var result = await _mediator.Send(command);
            return result.IsSuccess
            ? CreatedAtAction(nameof(GetById), new { id = result.Value }, result.Value)
            : result.ToActionResult();
        }

        [HttpPut("{id}")]
        [Authorize(Policy = "EditProduct")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Update(Guid id, [FromForm] UpdateProductCommand command)
        {
            if (id != command.Id)
                return Result<Unit>.BadRequest("ID in URL must match ID in body").ToActionResult();

            var result = await _mediator.Send(command);
            return result.ToActionResult();
        }

        [HttpDelete("{id}")]
        [Authorize(Policy = "Products.Delete")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await _mediator.Send(new DeleteProductCommand { Id = id });
            return result.ToActionResult();
        }

        #region Bulk Operations

        [HttpPost("import")]
        [Authorize(Policy = EPermissions.CreateProduct)]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> ImportProducts([FromForm] ImportProductsCommand command)
        {
            if (command.File == null || command.File.Length == 0)
            {
                return Result<ImportProductsResult>.BadRequest("No file was uploaded").ToActionResult();
            }

            var result = await _mediator.Send(command);
            return result.ToActionResult();
        }

        [HttpPost("validate-import")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> ValidateImport([FromForm] ImportProductsCommand command)
        {
            if (command.File == null || command.File.Length == 0)
            {
                return Result<ImportProductsResult>.BadRequest("No file was uploaded").ToActionResult();
            }

            // Chỉ validate không import
            command.ValidateOnly = true;
            var result = await _mediator.Send(command);
            return result.ToActionResult();
        }

        [HttpGet("export")]
        [Authorize(Policy = "ViewProducts")]
        public async Task<IActionResult> ExportProducts([FromQuery] ExportProductsCommand command)
        {
            var result = await _mediator.Send(command);

            if (!result.IsSuccess)
            {
                return result.ToActionResult();
            }

            return File(result.Value.FileData, result.Value.ContentType, result.Value.FileName);
        }

        [HttpGet("export-template")]
        //[Authorize(Policy = "ManageProducts")]
        public async Task<IActionResult> ExportTemplate([FromQuery] ExportProductsTemplateCommand command)
        {
            var result = await _mediator.Send(command);

            if (!result.IsSuccess)
            {
                return result.ToActionResult();
            }

            return File(result.Value.FileData, result.Value.ContentType, result.Value.FileName);
        }

        [HttpPost("bulk-delete")]
        [Authorize(Policy = "Products.Delete")]
        public async Task<IActionResult> BulkDelete([FromBody] List<Guid> ids)
        {
            if (ids == null || ids.Count == 0)
            {
                return Result<Unit>.BadRequest("No product IDs provided").ToActionResult();
            }

            var results = new List<Result<Unit>>();
            foreach (var id in ids)
            {
                var result = await _mediator.Send(new DeleteProductCommand { Id = id });
                results.Add(result);
            }

            // Kiểm tra kết quả
            int successCount = results.Count(r => r.IsSuccess);
            int failCount = results.Count - successCount;

            if (failCount == 0)
            {
                return Result<object>.Success(new { Message = $"Successfully deleted {successCount} products" }).ToActionResult();
            }
            else
            {
                return Result<object>.Success(new
                {
                    Message = $"Deleted {successCount} products, {failCount} operations failed",
                    SuccessCount = successCount,
                    FailCount = failCount
                }).ToActionResult();
            }
        }

        #endregion
    }
}

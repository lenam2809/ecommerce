using Ecommerce.Application.Features.Products.Queries.SearchProducts;
using Ecommerce.WebAPI.Extensions;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Ecommerce.WebAPI.Controllers
{
    [Route("api/search")]
    [ApiController]
    public class SearchController : ControllerBase
    {
        private readonly IMediator _mediator;

        public SearchController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("products")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status503ServiceUnavailable)]
        public async Task<IActionResult> SearchProducts(
            [FromQuery] SearchProductsQuery query,
            [FromQuery(Name = "q")] string? q,
            [FromQuery(Name = "page")] int? page,
            [FromQuery(Name = "categoryIds")] string? categoryIds,
            [FromQuery(Name = "brandIds")] string? brandIds)
        {
            if (string.IsNullOrWhiteSpace(query.Keyword) && string.IsNullOrWhiteSpace(query.Query))
            {
                query.Query = q;
            }

            if (page.HasValue)
            {
                query.Page = page;
            }

            if (!query.CategoryId.HasValue)
            {
                query.CategoryId = TryParseFirstGuid(categoryIds);
            }

            if (!query.BrandId.HasValue)
            {
                query.BrandId = TryParseFirstGuid(brandIds);
            }

            var result = await _mediator.Send(query);
            return result.ToActionResult();
        }

        private static Guid? TryParseFirstGuid(string? value)
        {
            var first = value?
                .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .FirstOrDefault();

            return Guid.TryParse(first, out var id) ? id : null;
        }
    }
}

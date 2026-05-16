using Ecommerce.Application.Features.SearchSuggestions.Commands.ClearSearchHistory;
using Ecommerce.Application.Features.SearchSuggestions.Commands.DeleteSearchSuggestion;
using Ecommerce.Application.Features.SearchSuggestions.Commands.SaveSearchHistory;
using Ecommerce.Application.Features.SearchSuggestions.Queries.GetSearchSuggestions;
using Ecommerce.Application.Features.SearchSuggestions.Queries.GetTrendingSuggestions;
using Ecommerce.WebAPI.Extensions;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Ecommerce.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SearchSuggestionsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public SearchSuggestionsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>
        /// Lấy danh sách gợi ý tìm kiếm cho header
        /// </summary>
        [HttpGet("search-suggestions")]
        public async Task<IActionResult> GetSearchSuggestions([FromQuery] string? query, [FromQuery] int limit = 5)
        {
            var result = await _mediator.Send(new GetSearchSuggestionsQuery
            {
                Query = query,
                Limit = limit
            });
            return result.ToActionResult();
        }

        /// <summary>
        /// Lưu lịch sử tìm kiếm từ header
        /// </summary>
        [HttpPost("search-history")]
        [Authorize]
        public async Task<IActionResult> SaveSearchHistory([FromBody] SaveSearchHistoryCommand command)
        {
            var result = await _mediator.Send(command);
            return result.ToActionResult();
        }

        /// <summary>
        /// Lấy các từ khóa tìm kiếm phổ biến cho header
        /// </summary>
        [HttpGet("search-trending")]
        public async Task<IActionResult> GetHeaderTrendingSuggestions([FromQuery] int limit = 10)
        {
            var result = await _mediator.Send(new GetTrendingSuggestionsQuery { Limit = limit });
            return result.ToActionResult();
        }

        /// <summary>
        /// Xóa một gợi ý tìm kiếm từ lịch sử của người dùng
        /// </summary>
        [HttpDelete("search-history/{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteHeaderSearchHistory(Guid id)
        {
            var result = await _mediator.Send(new DeleteSearchHistoryCommand { Id = id });
            return result.ToActionResult();
        }

        /// <summary>
        /// Xóa toàn bộ lịch sử tìm kiếm của người dùng
        /// </summary>
        [HttpDelete("search-history")]
        [Authorize]
        public async Task<IActionResult> ClearHeaderSearchHistory()
        {
            var result = await _mediator.Send(new ClearSearchHistoryCommand());
            return result.ToActionResult();
        }
    }
}


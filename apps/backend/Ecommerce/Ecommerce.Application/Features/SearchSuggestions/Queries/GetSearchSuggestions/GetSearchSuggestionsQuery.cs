using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.SearchSuggestions.Dto;
using MediatR;

namespace Ecommerce.Application.Features.SearchSuggestions.Queries.GetSearchSuggestions
{
    public class GetSearchSuggestionsQuery : IRequest<Result<List<SearchSuggestionDto>>>
    {
        public string? Query { get; set; }
        public int Limit { get; set; } = 5;
    }
}


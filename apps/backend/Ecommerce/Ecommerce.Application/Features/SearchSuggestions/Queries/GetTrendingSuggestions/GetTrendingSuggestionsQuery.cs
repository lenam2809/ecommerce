using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.SearchSuggestions.Dto;
using Ecommerce.Domain.Interfaces;
using AutoMapper;
using MediatR;

namespace Ecommerce.Application.Features.SearchSuggestions.Queries.GetTrendingSuggestions
{
    public class GetTrendingSuggestionsQuery : IRequest<Result<List<SearchSuggestionDto>>>
    {
        public int Limit { get; set; } = 10;
    }

    public class GetTrendingSuggestionsQueryHandler
    : IRequestHandler<GetTrendingSuggestionsQuery, Result<List<SearchSuggestionDto>>>
    {
        private readonly IProductRepository _repository;
        private readonly IMapper _mapper;

        public GetTrendingSuggestionsQueryHandler(IProductRepository repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<Result<List<SearchSuggestionDto>>> Handle(
            GetTrendingSuggestionsQuery request,
            CancellationToken cancellationToken)
        {
            var suggestions = await _repository.GetSearchSuggestiosAsync("", request.Limit, cancellationToken);

            if (suggestions == null || !suggestions.Any())
            {
                return Result<List<SearchSuggestionDto>>.BadRequest("Không tìm thấy gợi ý xu hướng.");
            }

            return Result<List<SearchSuggestionDto>>.Success(_mapper.Map<List<SearchSuggestionDto>>(suggestions));
        }
    }

}


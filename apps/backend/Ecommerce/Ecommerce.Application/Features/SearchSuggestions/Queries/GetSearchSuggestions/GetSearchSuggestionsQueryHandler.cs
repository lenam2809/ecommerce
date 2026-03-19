using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.SearchSuggestions.Dto;
using Ecommerce.Domain.Interfaces;
using AutoMapper;
using MediatR;

namespace Ecommerce.Application.Features.SearchSuggestions.Queries.GetSearchSuggestions
{
    public class GetSearchSuggestionsQueryHandler : IRequestHandler<GetSearchSuggestionsQuery, Result<List<SearchSuggestionDto>>>
    {
        private readonly IProductRepository _productRepository;
        private readonly IMapper _mapper;

        public GetSearchSuggestionsQueryHandler(IProductRepository productRepository, IMapper mapper)
        {
            _productRepository = productRepository;
            _mapper = mapper;
        }

        public async Task<Result<List<SearchSuggestionDto>>> Handle(GetSearchSuggestionsQuery request, CancellationToken cancellationToken)
        {
            var products = await _productRepository.GetSearchSuggestiosAsync(request.Query, request.Limit, cancellationToken);

            return Result<List<SearchSuggestionDto>>.Success(_mapper.Map<List<SearchSuggestionDto>>(products));
        }
    }
}


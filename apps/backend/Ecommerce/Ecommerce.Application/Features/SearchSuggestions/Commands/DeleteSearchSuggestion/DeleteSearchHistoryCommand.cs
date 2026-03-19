using Ecommerce.Application.Common.Models;
using MediatR;

namespace Ecommerce.Application.Features.SearchSuggestions.Commands.DeleteSearchSuggestion
{
    public class DeleteSearchHistoryCommand : IRequest<Result<bool>>
    {
        public Guid Id { get; set; }
    }
}


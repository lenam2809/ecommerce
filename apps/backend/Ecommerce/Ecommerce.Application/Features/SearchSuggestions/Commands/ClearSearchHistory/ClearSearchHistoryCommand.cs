using Ecommerce.Application.Common.Models;
using MediatR;

namespace Ecommerce.Application.Features.SearchSuggestions.Commands.ClearSearchHistory
{
    public class ClearSearchHistoryCommand : IRequest<Result<bool>>
    {
        public Guid UserId { get; set; }
    }
}


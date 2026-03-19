using Ecommerce.Application.Common.Models;
using MediatR;

namespace Ecommerce.Application.Features.SearchSuggestions.Commands.SaveSearchHistory
{
    public class SaveSearchHistoryCommand : IRequest<Result<Guid>>
    {
        public string SearchText { get; set; } = string.Empty;
        public Guid? UserId { get; set; }
        public string? CategoryName { get; set; }
    }
}


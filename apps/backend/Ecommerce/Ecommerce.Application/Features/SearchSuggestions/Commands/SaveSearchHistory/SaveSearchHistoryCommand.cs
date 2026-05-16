using Ecommerce.Application.Common.Interfaces;
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

    public class SaveSearchHistoryCommandHandler : IRequestHandler<SaveSearchHistoryCommand, Result<Guid>>
    {
        private readonly ICurrentUserService _currentUserService;

        public SaveSearchHistoryCommandHandler(ICurrentUserService currentUserService)
        {
            _currentUserService = currentUserService;
        }

        public Task<Result<Guid>> Handle(SaveSearchHistoryCommand request, CancellationToken cancellationToken)
        {
            if (!_currentUserService.UserId.HasValue)
            {
                return Task.FromResult(Result<Guid>.Unauthorized());
            }

            request.UserId = _currentUserService.UserId.Value;
            return Task.FromResult(Result<Guid>.ServiceUnavailable("Search history persistence is not configured."));
        }
    }
}

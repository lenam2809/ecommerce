using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using MediatR;

namespace Ecommerce.Application.Features.SearchSuggestions.Commands.ClearSearchHistory
{
    public class ClearSearchHistoryCommand : IRequest<Result<bool>>
    {
    }

    public class ClearSearchHistoryCommandHandler : IRequestHandler<ClearSearchHistoryCommand, Result<bool>>
    {
        private readonly ICurrentUserService _currentUserService;

        public ClearSearchHistoryCommandHandler(ICurrentUserService currentUserService)
        {
            _currentUserService = currentUserService;
        }

        public Task<Result<bool>> Handle(ClearSearchHistoryCommand request, CancellationToken cancellationToken)
        {
            if (!_currentUserService.UserId.HasValue)
            {
                return Task.FromResult(Result<bool>.Unauthorized());
            }

            return Task.FromResult(Result<bool>.ServiceUnavailable("Search history persistence is not configured."));
        }
    }
}

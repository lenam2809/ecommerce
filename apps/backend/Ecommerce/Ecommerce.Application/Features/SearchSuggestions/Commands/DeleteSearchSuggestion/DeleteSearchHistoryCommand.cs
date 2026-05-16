using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using MediatR;

namespace Ecommerce.Application.Features.SearchSuggestions.Commands.DeleteSearchSuggestion
{
    public class DeleteSearchHistoryCommand : IRequest<Result<bool>>
    {
        public Guid Id { get; set; }
    }

    public class DeleteSearchHistoryCommandHandler : IRequestHandler<DeleteSearchHistoryCommand, Result<bool>>
    {
        private readonly ICurrentUserService _currentUserService;

        public DeleteSearchHistoryCommandHandler(ICurrentUserService currentUserService)
        {
            _currentUserService = currentUserService;
        }

        public Task<Result<bool>> Handle(DeleteSearchHistoryCommand request, CancellationToken cancellationToken)
        {
            if (!_currentUserService.UserId.HasValue)
            {
                return Task.FromResult(Result<bool>.Unauthorized());
            }

            return Task.FromResult(Result<bool>.ServiceUnavailable("Search history persistence is not configured."));
        }
    }
}

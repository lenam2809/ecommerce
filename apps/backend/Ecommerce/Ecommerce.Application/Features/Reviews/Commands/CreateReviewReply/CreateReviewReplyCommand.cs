using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Reviews.Dto;
using MediatR;

namespace Ecommerce.Application.Features.Reviews.Commands.CreateReviewReply
{
    public record CreateReviewReplyCommand : IRequest<Result<ReviewReplyDto>>
    {
        public Guid ReviewId { get; init; }
        public Guid UserId { get; init; }
        public required string Content { get; init; }
    }
}


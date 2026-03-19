using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Reviews.Dto;
using MediatR;

namespace Ecommerce.Application.Features.Reviews.Queries.GetReviewReplies
{
    public record GetReviewRepliesQuery(Guid ReviewId, Guid? CurrentUserId = null) : IRequest<Result<List<ReviewReplyDto>>>;

}


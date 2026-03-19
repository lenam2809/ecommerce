using Ecommerce.Application.Common.Models;
using MediatR;

namespace Ecommerce.Application.Features.Reviews.Commands.LikeReview
{
    public record LikeReviewCommand(Guid ReviewId, Guid UserId) : IRequest<Result<int>>;

}


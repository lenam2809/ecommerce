using Ecommerce.Application.Features.Products.Queries.GetProductReviews;
using Ecommerce.Application.Features.Reviews.Commands.CreateReview;
using Ecommerce.Application.Features.Reviews.Commands.CreateReviewReply;
using Ecommerce.Application.Features.Reviews.Commands.LikeReview;
using Ecommerce.Application.Features.Reviews.Dto;
using Ecommerce.Application.Features.Reviews.Queries.GetReviewReplies;
using Ecommerce.WebAPI.Extensions;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Ecommerce.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ReviewsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public ReviewsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<IActionResult> GetReviews(Guid productId)
        {
            var query = new GetProductReviewsQuery(productId);
            var result = await _mediator.Send(query);
            return result.ToActionResult();
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateReview(CreateReviewCommand command)
        {
            var result = await _mediator.Send(command);
            return result.ToActionResult();
        }

        [HttpPost("{reviewId}/like")]
        [Authorize]
        public async Task<IActionResult> LikeReview(Guid reviewId)
        {
            var userId = User.GetUserId();
            if (userId == Guid.Empty)
                return Unauthorized();

            var command = new LikeReviewCommand(reviewId, userId);
            var result = await _mediator.Send(command);
            return result.ToActionResult();
        }

        [HttpGet("{reviewId}/replies")]
        public async Task<IActionResult> GetReviewReplies(Guid reviewId)
        {
            // Lấy userId từ token nếu user đã đăng nhập để check liked status
            var userId = User.GetUserId();

            var query = new GetReviewRepliesQuery(reviewId, userId);
            var result = await _mediator.Send(query);
            return result.ToActionResult();
        }

        [HttpPost("{reviewId}/replies")]
        [Authorize]
        public async Task<IActionResult> CreateReviewReply(Guid reviewId, [FromBody] CreateReviewReplyRequest request)
        {
            var userId = User.GetUserId();
            if (userId == Guid.Empty)
                return Unauthorized();

            if (string.IsNullOrWhiteSpace(request.Content))
                return BadRequest("Content is required");

            var command = new CreateReviewReplyCommand
            {
                ReviewId = reviewId,
                UserId = userId,
                Content = request.Content.Trim()
            };

            var result = await _mediator.Send(command);
            return result.ToActionResult();
        }
    }
}


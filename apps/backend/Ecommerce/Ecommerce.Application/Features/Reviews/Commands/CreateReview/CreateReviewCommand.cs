using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Reviews.Dto;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace Ecommerce.Application.Features.Reviews.Commands.CreateReview
{
    public record CreateReviewCommand() : IRequest<Result<ReviewDto>>
    {
        public Guid ProductId { get; init; }
        public Guid UserId { get; init; }
        public int Rating { get; set; }
        public required string Content { get; set; }
        public List<IFormFile> Images { get; set; } = new();
    }
}


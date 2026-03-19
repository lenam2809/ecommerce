using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Products.Dto;
using MediatR;

namespace Ecommerce.Application.Features.Products.Queries.GetProductReviews
{
    public record GetProductReviewsQuery(Guid ProductId) : IRequest<Result<ReviewsResponseDto>>;
}


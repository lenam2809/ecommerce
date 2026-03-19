using Ecommerce.Application.Common.Mappings;
using Ecommerce.Domain.Entities;
using AutoMapper;

namespace Ecommerce.Application.Features.Reviews.Dto
{
    public class ReviewReplyDto : IMapFrom<ReviewReply>
    {
        public Guid Id { get; set; }
        public Guid ReviewId { get; set; }
        public Guid UserId { get; set; }
        public required string UserName { get; set; }
        public required string UserAvatar { get; set; }
        public required string Content { get; set; }
        public DateTime Date { get; set; }
        public int Likes { get; set; }
        public bool IsVerified { get; set; }
        public bool IsLikedByCurrentUser { get; set; }

        public void Mapping(Profile profile)
        {
            profile.CreateMap<ReviewReply, ReviewReplyDto>();
        }
    }

    public class CreateReviewReplyRequest
    {
        public required string Content { get; set; }
    }
}


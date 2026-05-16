using Ecommerce.Application.Common.Mappings;
using Ecommerce.Domain.Entities;
using AutoMapper;

namespace Ecommerce.Application.Features.Reviews.Dto
{
    public class ReviewDto : IMapFrom<Review>
    {
        public Guid Id { get; set; }
        public required string UserName { get; set; }
        public required string UserAvatar { get; set; }
        public int Rating { get; set; }
        public required string Content { get; set; }
        public DateTime Date { get; set; }
        public bool IsVerified { get; set; }
        public Guid ProductId { get; set; }
        public Guid ApplicationUserId { get; set; }
        public List<string> Images { get; set; } = new();


        public void Mapping(Profile profile)
        {
            profile.CreateMap<Review, ReviewDto>()
                .ForMember(dest => dest.Images, opt => opt.MapFrom(src => src.Images.Select(img => img.Url).ToList()));
        }
    }
}


using Ecommerce.Application.Common.Mappings;
using Ecommerce.Domain.Entities;
using AutoMapper;

namespace Ecommerce.Application.Features.Products.Dto
{
    public class ReviewDto : IMapFrom<Review>
    {
        public Guid Id { get; set; }
        public required string UserName { get; set; }
        public required string UserAvatar { get; set; }
        public int Rating { get; set; }
        public DateTime Date { get; set; }
        public required string Content { get; set; }
        public int Likes { get; set; }
        public int Replies { get; set; }
        public bool IsVerified { get; set; }
        public int HelpfulCount { get; set; }
        public List<string> ImageUrls { get; set; } = []; // Chuyển danh sách ảnh thành URL

        public Guid ProductId { get; set; }
        public Guid ApplicationUserId { get; set; }

        public void Mapping(Profile profile)
        {
            profile.CreateMap<Review, ReviewDto>()
               .ForMember(dest => dest.ImageUrls, opt => opt.MapFrom(src => src.Images.Select(img => img.Url).ToList()));

        }
    }
}


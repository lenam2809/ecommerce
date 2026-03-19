using Ecommerce.Application.Common.Mappings;
using Ecommerce.Domain.Entities;
using AutoMapper;

namespace Ecommerce.Application.Features.Banners.Dto
{
    public class BannerDto : IMapFrom<Banner>
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
        public string ButtonText { get; set; } = string.Empty;
        public string ButtonLink { get; set; } = string.Empty;
        public bool IsActive { get; set; }

        public void Mapping(Profile profile)
        {
            profile.CreateMap<Banner, BannerDto>();
        }
    }
}


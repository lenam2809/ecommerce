using Ecommerce.Application.Common.Mappings;
using Ecommerce.Application.Features.About.Dto;
using AutoMapper;

namespace Ecommerce.Application.Features.Contact.Dto
{
    public class ContactDto : IMapFrom<Ecommerce.Domain.Entities.Contact>
    {
        public Guid Id { get; set; }
        public required ContactInfoDto Phone { get; set; }
        public required ContactInfoDto Email { get; set; }
        public required ContactInfoDto Office { get; set; }
        public List<SocialLinkDto> Social { get; set; } = [];
        public List<FaqItemDto> Faqs { get; set; } = [];
        public bool IsActive { get; set; } = false;

        public void Mapping(Profile profile)
        {
            profile.CreateMap<Ecommerce.Domain.Entities.Contact, ContactDto>()
                 .ForMember(d => d.Social, opt => opt.MapFrom(s => s.SocialLinks));
            profile.CreateMap<AboutDto, Ecommerce.Domain.Entities.About>();
        }
    }

    public class ContactInfoDto : IMapFrom<Ecommerce.Domain.Entities.ContactInfo>
    {
        public required string NumberOrAddress { get; set; }
        public required string HoursOrDescription { get; set; }

        public void Mapping(Profile profile)
        {
            profile.CreateMap<Ecommerce.Domain.Entities.ContactInfo, ContactInfoDto>()
                 .ForMember(d => d.NumberOrAddress, opt => opt.MapFrom(s => s.Value))
                  .ForMember(d => d.HoursOrDescription, opt => opt.MapFrom(s => s.Description));
            profile.CreateMap<ContactInfoDto, Ecommerce.Domain.Entities.ContactInfo>();
        }
    }

    public class SocialLinkDto : IMapFrom<Ecommerce.Domain.Entities.SocialLink>
    {
        public required string Name { get; set; }
        public required string Url { get; set; }

        public void Mapping(Profile profile)
        {
            profile.CreateMap<Ecommerce.Domain.Entities.SocialLink, SocialLinkDto>();
            profile.CreateMap<SocialLinkDto, Ecommerce.Domain.Entities.SocialLink>();
        }
    }

    public class FaqItemDto : IMapFrom<Ecommerce.Domain.Entities.FaqItem>
    {
        public required string Question { get; set; }
        public required string Answer { get; set; }

        public void Mapping(Profile profile)
        {
            profile.CreateMap<Ecommerce.Domain.Entities.FaqItem, FaqItemDto>();
            profile.CreateMap<FaqItemDto, Ecommerce.Domain.Entities.FaqItem>();
        }
    }
}


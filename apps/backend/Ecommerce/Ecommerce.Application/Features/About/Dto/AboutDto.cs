using Ecommerce.Application.Common.Mappings;
using AutoMapper;

namespace Ecommerce.Application.Features.About.Dto
{
    public class AboutDto : IMapFrom<Ecommerce.Domain.Entities.About>
    {
        public Guid Id { get; set; }
        public required HeroSectionDto Hero { get; set; }
        public List<ValueItemDto> Values { get; set; } = [];
        public required HistorySectionDto History { get; set; }
        public List<TeamMemberDto> Team { get; set; } = [];
        public required CtaSectionDto Cta { get; set; }
        public bool IsActive { get; set; } = false;
        public void Mapping(Profile profile)
        {
            profile.CreateMap<Ecommerce.Domain.Entities.About, AboutDto>()
                .ForMember(dest => dest.Values, opt =>
                    opt.MapFrom(src => src.Values.Select(v => new ValueItemDto
                    {
                        Title = v.Title,
                        Description = v.Description
                    }).ToList()));
            profile.CreateMap<AboutDto, Ecommerce.Domain.Entities.About>();
        }
    }

    public class HeroSectionDto : IMapFrom<Ecommerce.Domain.Entities.HeroSection>
    {
        public required string Title { get; set; }
        public required string Description { get; set; }

        public void Mapping(AutoMapper.Profile profile)
        {
            profile.CreateMap<Ecommerce.Domain.Entities.HeroSection, HeroSectionDto>();
            profile.CreateMap<HeroSectionDto, Ecommerce.Domain.Entities.HeroSection>();
        }
    }

    public class ValueItemDto : IMapFrom<Ecommerce.Domain.Entities.ValueItem>
    {
        public required string Title { get; set; }
        public required string Description { get; set; }

        public void Mapping(AutoMapper.Profile profile)
        {
            profile.CreateMap<Ecommerce.Domain.Entities.ValueItem, ValueItemDto>();
            profile.CreateMap<ValueItemDto, Ecommerce.Domain.Entities.ValueItem>();
        }
    }

    public class HistorySectionDto : IMapFrom<Ecommerce.Domain.Entities.HistorySection>
    {
        public required string Title { get; set; }
        public List<string> Paragraphs { get; set; } = [];

        public void Mapping(AutoMapper.Profile profile)
        {
            profile.CreateMap<Ecommerce.Domain.Entities.HistorySection, HistorySectionDto>()
                .ForMember(dest => dest.Paragraphs, opt =>
        opt.MapFrom(src => src.Paragraphs.Select(p => p.Content).ToList())); ;
            profile.CreateMap<HistorySectionDto, Ecommerce.Domain.Entities.HistorySection>();
        }
    }

    public class TeamMemberDto : IMapFrom<Ecommerce.Domain.Entities.TeamMember>
    {
        public Guid Id { get; set; }
        public required string Name { get; set; }
        public required string Role { get; set; }
        public required string ImageUrl { get; set; }
        public required string Bio { get; set; }
        public void Mapping(AutoMapper.Profile profile)
        {
            profile.CreateMap<Ecommerce.Domain.Entities.TeamMember, TeamMemberDto>();
            profile.CreateMap<TeamMemberDto, Ecommerce.Domain.Entities.TeamMember>();
        }
    }

    public class CtaSectionDto : IMapFrom<Ecommerce.Domain.Entities.CtaSection>
    {
        public required string Title { get; set; }
        public required string Description { get; set; }

        public void Mapping(AutoMapper.Profile profile)
        {
            profile.CreateMap<Ecommerce.Domain.Entities.CtaSection, CtaSectionDto>();
            profile.CreateMap<CtaSectionDto, Ecommerce.Domain.Entities.CtaSection>();
        }
    }
}


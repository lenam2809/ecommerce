using Ecommerce.Application.Common.Mappings;
using Ecommerce.Domain.Entities;
using AutoMapper;

namespace Ecommerce.Application.Features.SearchSuggestions.Dto
{
    public class SearchSuggestionDto : IMapFrom<Product>
    {
        public Guid Id { get; set; }
        public string Text { get; set; } = string.Empty;
        public DateTime LastSearched { get; set; }
        public bool IsTrending { get; set; }
        public string? CategoryName { get; set; }
        public string? CategoryIcon { get; set; }
        public void Mapping(Profile profile)
        {
            profile.CreateMap<Product, SearchSuggestionDto>()
                .ForMember(dest => dest.Text, opt => opt.MapFrom(src => src.Name))
                .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.Category.Name))
                .ForMember(dest => dest.CategoryIcon, opt => opt.MapFrom(src => src.Category.Image));
        }
    }
}


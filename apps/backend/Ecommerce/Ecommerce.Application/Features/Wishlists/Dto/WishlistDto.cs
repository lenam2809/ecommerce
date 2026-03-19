using AutoMapper;
using Ecommerce.Application.Common.Mappings;
using Ecommerce.Domain.Entities;

namespace Ecommerce.Application.Features.Wishlists.Dto
{
    public class WishlistDto : IMapFrom<Wishlist>
    {
        public Guid Id { get; set; }
        public Guid ApplicationUserId { get; set; }
        public List<WishlistItemDto> Items { get; set; } = [];
        public int WishlistItemLimit { get; set; }

        public void Mapping(Profile profile)
        {
            profile.CreateMap<Wishlist, WishlistDto>()
                 .ForMember(dest => dest.Items, opt => opt.MapFrom(src => src.WishlistItems));
        }
    }

    public class WishlistItemDto : IMapFrom<WishlistItem>
    {
        public Guid ProductId { get; set; }
        public required string ProductName { get; set; }
        public required string Slug { get; set; }
        public decimal Price { get; set; }
        public required string ImageUrl { get; set; }
        public DateTime DateAdded { get; set; }

        public void Mapping(Profile profile)
        {
            profile.CreateMap<WishlistItem, WishlistItemDto>()
                .ForMember(dest => dest.Slug, opt => opt.MapFrom(src => src.Product.Slug))
                .ForMember(dest => dest.ProductName, opt => opt.MapFrom(src => src.Product.Name))
                .ForMember(dest => dest.Price, opt => opt.MapFrom(src => src.Product.Price))
                .ForMember(dest => dest.ImageUrl, opt => opt.MapFrom(src => src.Product.Image));
        }
    }
}


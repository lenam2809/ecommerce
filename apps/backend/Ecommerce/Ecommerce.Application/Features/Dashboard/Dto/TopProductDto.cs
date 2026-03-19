using Ecommerce.Application.Common.Mappings;
using Ecommerce.Domain.Entities;
using AutoMapper;

namespace Ecommerce.Application.Features.Dashboard.Dto
{
    public class TopProductDto : IMapFrom<Product>
    {
        public Guid ProductId { get; set; }
        public required string ProductName { get; set; }
        public int QuantitySold { get; set; }
        public required string MainImage { get; set; }
        public decimal Price { get; set; }

        public void Mapping(Profile profile)
        {
            profile.CreateMap<Product, TopProductDto>()
                .ForMember(d => d.ProductId, opt => opt.MapFrom(s => s.Id))
                .ForMember(d => d.ProductName, opt => opt.MapFrom(s => s.Name))
                .ForMember(d => d.MainImage, opt => opt.MapFrom(s => s.Image))
                .ForMember(d => d.QuantitySold, opt => opt.Ignore());
        }
    }
}


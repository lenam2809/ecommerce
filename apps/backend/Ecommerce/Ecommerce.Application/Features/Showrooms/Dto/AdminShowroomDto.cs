using AutoMapper;
using Ecommerce.Application.Common.Mappings;
using Ecommerce.Domain.Entities;

namespace Ecommerce.Application.Features.Showrooms.Dto
{
    public class AdminShowroomDto : IMapFrom<Showroom>
    {
        public Guid Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Region { get; set; } = "HCM";
        public string City { get; set; } = string.Empty;
        public string Province { get; set; } = string.Empty;
        public string District { get; set; } = string.Empty;
        public string? Ward { get; set; }
        public string Address { get; set; } = string.Empty;
        public string Phone { get; set; } = "1800 6868";
        public string OpeningHours { get; set; } = "08:00 - 21:30";
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public string? GoogleMapIframeUrl { get; set; }
        public bool IsFlagship { get; set; }
        public bool HasInstantPickup { get; set; }
        public bool IsActive { get; set; }
        public int DisplayOrder { get; set; }
        public int TotalSkusWithStock { get; set; }
        public int TotalStockQuantity { get; set; }

        public void Mapping(Profile profile)
        {
            profile.CreateMap<Showroom, AdminShowroomDto>()
                .ForMember(d => d.TotalSkusWithStock, opt => opt.Ignore())
                .ForMember(d => d.TotalStockQuantity, opt => opt.Ignore());
        }
    }
}

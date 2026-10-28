using AutoMapper;
using Ecommerce.Application.Common.Mappings;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Showrooms.Dto;
using Ecommerce.Domain.Entities;
using MediatR;

namespace Ecommerce.Application.Features.Showrooms.Commands.CreateShowroom
{
    public class CreateShowroomCommand : IRequest<Result<ShowroomDto>>, IMapFrom<Showroom>
    {
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Region { get; set; } = "HCM"; // HCM, HN, DN, CT, Other
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
        public bool IsFlagship { get; set; } = false;
        public bool HasInstantPickup { get; set; } = true;
        public bool IsActive { get; set; } = true;
        public int DisplayOrder { get; set; } = 0;

        public void Mapping(Profile profile)
        {
            profile.CreateMap<CreateShowroomCommand, Showroom>()
                .ForMember(d => d.Id, opt => opt.Ignore())
                .ForMember(d => d.Inventories, opt => opt.Ignore())
                .ForMember(d => d.Orders, opt => opt.Ignore());
        }
    }
}

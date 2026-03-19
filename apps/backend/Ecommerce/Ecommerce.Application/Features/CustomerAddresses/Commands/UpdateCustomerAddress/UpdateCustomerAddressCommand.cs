using Ecommerce.Application.Common.Mappings;
using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Entities;
using AutoMapper;
using MediatR;

namespace Ecommerce.Application.Features.CustomerAddresses.Commands.UpdateCustomerAddress
{
    public class UpdateCustomerAddressCommand : IRequest<Result<Unit>>, IMapFrom<CustomerAddress>
    {
        public Guid Id { get; set; }
        public Guid ApplicationUserId { get; set; }
        public required string AddressType { get; set; }
        public required string FullName { get; set; }
        public required string Street { get; set; }
        public required string City { get; set; }
        public required string State { get; set; }
        public required string PostalCode { get; set; }
        public required string Country { get; set; }
        public required string Phone { get; set; }
        public bool IsDefault { get; set; }

        public void Mapping(Profile profile)
        {
            profile.CreateMap<UpdateCustomerAddressCommand, CustomerAddress>()
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTime.Now));
        }
    }
}


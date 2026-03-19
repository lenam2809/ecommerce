using Ecommerce.Application.Common.Mappings;
using Ecommerce.Domain.Entities;
using AutoMapper;

namespace Ecommerce.Application.Features.CustomerAddresses.Dto
{
    public class CustomerAddressDto : IMapFrom<CustomerAddress>
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
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        public void Mapping(Profile profile)
        {
            profile.CreateMap<CustomerAddress, CustomerAddressDto>();
        }
    }
}


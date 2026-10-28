using Ecommerce.Application.Common.Mappings;
using Ecommerce.Domain.Entities;
using AutoMapper;

namespace Ecommerce.Application.Features.Orders.Dto
{
    public class OrderItemSerialDto : IMapFrom<OrderItemSerial>
    {
        public Guid Id { get; set; }
        public string SerialNumber { get; set; } = string.Empty;
        public string? Imei { get; set; }
        public int WarrantyMonths { get; set; } = 24;
        public DateTime? ActivatedAt { get; set; }
        public DateTime? WarrantyExpiresAt { get; set; }
        public string WarrantyStatus { get; set; } = "Inactive";

        public void Mapping(Profile profile)
        {
            profile.CreateMap<OrderItemSerial, OrderItemSerialDto>();
        }
    }
}

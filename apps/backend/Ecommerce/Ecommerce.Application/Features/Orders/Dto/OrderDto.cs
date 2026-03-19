using Ecommerce.Application.Common.Mappings;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;
using AutoMapper;

namespace Ecommerce.Application.Features.Orders.Dto
{
    public class OrderDto : IMapFrom<Order>
    {
        public Guid Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public Guid ApplicationUserId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }
        public DateTime OrderDate { get; set; }
        public string ShippingAddress { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public EOrderStatus Status { get; set; }
        public string StatusString => Status.ToString();
        public string? DiscountCode { get; set; }
        public string? DeliveryInstructions { get; set; }
        public DateTime? ExpectedDeliveryDate { get; set; }
        public string? RowVersion { get; set; }
        public List<OrderItemDto> OrderItems { get; set; } = [];

        public void Mapping(Profile profile)
        {
            profile.CreateMap<Order, OrderDto>()
                .ForMember(d => d.CustomerName, opt => opt.MapFrom(s =>
                    s.ApplicationUser != null ? $"{s.ApplicationUser.FirstName} {s.ApplicationUser.LastName}" : string.Empty))
                .ForMember(d => d.RowVersion, opt => opt.MapFrom(s => s.ConcurrencyToken != null ? Convert.ToBase64String(s.ConcurrencyToken) : null));
        }
    }
}


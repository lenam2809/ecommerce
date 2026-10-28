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
        public Guid? ApplicationUserId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public bool IsGuestOrder { get; set; }
        public string? GuestName { get; set; }
        public string? GuestEmail { get; set; }
        public string? GuestId { get; set; }
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
        public Guid? ShowroomId { get; set; }
        public Guid? PickupShowroomId { get; set; }
        public string? ShowroomName { get; set; }
        public string DeliveryMethod { get; set; } = "StandardDelivery";
        public EDeliveryType DeliveryType { get; set; } = EDeliveryType.HomeDelivery;
        public decimal DepositRequired { get; set; }
        public EDepositStatus DepositStatus { get; set; } = EDepositStatus.None;
        public decimal DepositAmount { get; set; }
        public decimal Subtotal { get; set; }
        public decimal ShippingCost { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal RemainingAmount { get; set; }
        public string PaymentMethod { get; set; } = "COD";
        public string PaymentStatus { get; set; } = "Pending";
        public string? CarrierName { get; set; }
        public string? TrackingNumber { get; set; }
        public string? DriverName { get; set; }
        public string? DriverPhone { get; set; }
        public OrderInvoiceDto? Invoice { get; set; }
        public List<OrderItemDto> OrderItems { get; set; } = [];

        public void Mapping(Profile profile)
        {
            profile.CreateMap<Order, OrderDto>()
                .ForMember(d => d.CustomerName, opt => opt.MapFrom(s =>
                    s.ApplicationUser != null
                        ? $"{s.ApplicationUser.FirstName} {s.ApplicationUser.LastName}".Trim()
                        : (s.GuestName ?? string.Empty)))
                .ForMember(d => d.ShowroomName, opt => opt.MapFrom(s => s.Showroom != null ? s.Showroom.Name : null))
                .ForMember(d => d.Invoice, opt => opt.MapFrom(s => s.Invoice != null && s.Invoice.RequireInvoice ? s.Invoice : null))
                .ForMember(d => d.RowVersion, opt => opt.MapFrom(s => s.ConcurrencyToken != null ? Convert.ToBase64String(s.ConcurrencyToken) : null));
        }
    }
}

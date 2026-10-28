using Ecommerce.Application.Common.Mappings;
using Ecommerce.Domain.Entities;
using AutoMapper;

namespace Ecommerce.Application.Features.Orders.Dto
{
    public class OrderItemDto : IMapFrom<OrderItem>
    {
        public Guid Id { get; set; }
        public Guid OrderId { get; set; }
        public Guid ProductId { get; set; }
        public required string Name { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice => Quantity * UnitPrice;
        public required string Image { get; set; }
        public required string Color { get; set; }
        public required string Size { get; set; }
        public Guid? AddOnId { get; set; }
        public string? AddOnName { get; set; }
        public decimal AddOnPrice { get; set; }
        public int WarrantyMonths { get; set; } = 24;
        public Guid? ProductVariantSkuId { get; set; }
        public string? SkuCode { get; set; }
        public string? VariantInfo { get; set; }
        public List<OrderItemSerialDto> AssignedSerials { get; set; } = [];

        public void Mapping(Profile profile)
        {
            profile.CreateMap<OrderItem, OrderItemDto>()
                .ForMember(d => d.AssignedSerials, opt => opt.MapFrom(s => s.OrderItemSerials));
        }
    }
}

using Ecommerce.Application.Common.Mappings;
using Ecommerce.Domain.Entities;
using AutoMapper;

namespace Ecommerce.Application.Features.Orders.Dto
{
    public class OrderItemDto : IMapFrom<OrderItem>
    {
        public Guid OrderId { get; set; }
        public Guid ProductId { get; set; }
        public required string Name { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice => Quantity * UnitPrice;
        public required string Image { get; set; }
        public required string Color { get; set; }
        public required string Size { get; set; }

        public void Mapping(Profile profile)
        {
            profile.CreateMap<OrderItem, OrderItemDto>();
        }
    }
}


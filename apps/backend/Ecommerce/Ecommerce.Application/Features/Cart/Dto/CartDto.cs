using Ecommerce.Application.Common.Mappings;
using Ecommerce.Domain.Entities;
using AutoMapper;

namespace Ecommerce.Application.Features.Cart.Dto
{
    public class CartDto : IMapFrom<Ecommerce.Domain.Entities.Cart>
    {
        public List<CartItemDto> Items { get; set; } = [];
        public decimal Subtotal { get; set; }
        public decimal ShippingCost { get; set; }
        public decimal Discount { get; set; }
        public decimal Total { get; set; }
        public void Mapping(Profile profile)
        {
            profile.CreateMap<Ecommerce.Domain.Entities.Cart, CartDto>();
        }
    }

    public class CartItemDto : IMapFrom<CartItem>
    {
        public Guid CartId { get; set; }
        public Guid ProductId { get; set; }
        public required string Name { get; set; }
        public decimal Price { get; set; }
        public int Quantity { get; set; }
        public required string Image { get; set; }
        public string? Color { get; set; }
        public string? Size { get; set; }
        public void Mapping(Profile profile)
        {
            profile.CreateMap<CartItem, CartItemDto>();
        }
    }
}


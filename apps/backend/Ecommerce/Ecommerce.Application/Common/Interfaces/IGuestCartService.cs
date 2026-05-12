using Ecommerce.Application.Features.Cart.Dto;
using Ecommerce.Domain.Entities;

namespace Ecommerce.Application.Common.Interfaces
{
    public interface IGuestCartService
    {
        Task<CartDto> GetCartAsync(string guestId, CancellationToken cancellationToken = default);
        Task<CartDto> AddItemAsync(string guestId, Product product, int quantity, string? color, string? size, CancellationToken cancellationToken = default);
        Task<CartDto> UpdateItemAsync(string guestId, Guid productId, int quantity, CancellationToken cancellationToken = default);
        Task<CartDto> RemoveItemAsync(string guestId, Guid productId, CancellationToken cancellationToken = default);
        Task<CartDto> ClearCartAsync(string guestId, CancellationToken cancellationToken = default);
        Task<CartDto> ApplyPromoCodeAsync(string guestId, string code, CancellationToken cancellationToken = default);
        Task DeleteCartAsync(string guestId, CancellationToken cancellationToken = default);
    }
}

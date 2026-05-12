using Ecommerce.Application.Common.Configs;
using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Features.Cart.Dto;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Services;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Text.Json;

namespace Ecommerce.Infrastructure.Cache
{
    public class RedisGuestCartService : IGuestCartService
    {
        private readonly IDistributedCache _cache;
        private readonly IShippingCalculator _shippingCalculator;
        private readonly CacheConfig _cacheConfig;
        private readonly ILogger<RedisGuestCartService> _logger;

        private static readonly JsonSerializerOptions JsonOptions = new()
        {
            PropertyNameCaseInsensitive = true
        };

        public RedisGuestCartService(
            IDistributedCache cache,
            IShippingCalculator shippingCalculator,
            IOptions<CacheConfig> cacheOptions,
            ILogger<RedisGuestCartService> logger)
        {
            _cache = cache;
            _shippingCalculator = shippingCalculator;
            _cacheConfig = cacheOptions.Value;
            _logger = logger;
        }

        public async Task<CartDto> GetCartAsync(string guestId, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(guestId))
            {
                return new CartDto();
            }

            try
            {
                var payload = await _cache.GetStringAsync(GetKey(guestId), cancellationToken);
                if (string.IsNullOrWhiteSpace(payload))
                {
                    return new CartDto();
                }

                return JsonSerializer.Deserialize<CartDto>(payload, JsonOptions) ?? new CartDto();
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to read guest cart {GuestId} from Redis", guestId);
                return new CartDto();
            }
        }

        public async Task<CartDto> AddItemAsync(string guestId, Product product, int quantity, string? color, string? size, CancellationToken cancellationToken = default)
        {
            var cart = await GetCartAsync(guestId, cancellationToken);
            var item = cart.Items.FirstOrDefault(i =>
                i.ProductId == product.Id &&
                string.Equals(i.Color, color, StringComparison.OrdinalIgnoreCase) &&
                string.Equals(i.Size, size, StringComparison.OrdinalIgnoreCase));

            if (item == null)
            {
                cart.Items.Add(new CartItemDto
                {
                    CartId = Guid.Empty,
                    ProductId = product.Id,
                    Name = product.Name,
                    Price = product.SalePrice ?? product.Price,
                    Quantity = quantity,
                    Image = product.Image,
                    Color = color ?? string.Empty,
                    Size = size ?? string.Empty
                });
            }
            else
            {
                item.Quantity += quantity;
            }

            await SaveAsync(guestId, Recalculate(cart), cancellationToken);
            return cart;
        }

        public async Task<CartDto> UpdateItemAsync(string guestId, Guid productId, int quantity, CancellationToken cancellationToken = default)
        {
            var cart = await GetCartAsync(guestId, cancellationToken);
            var item = cart.Items.FirstOrDefault(i => i.ProductId == productId);

            if (item == null)
            {
                return cart;
            }

            if (quantity <= 0)
            {
                cart.Items.Remove(item);
            }
            else
            {
                item.Quantity = quantity;
            }

            await SaveAsync(guestId, Recalculate(cart), cancellationToken);
            return cart;
        }

        public async Task<CartDto> RemoveItemAsync(string guestId, Guid productId, CancellationToken cancellationToken = default)
        {
            var cart = await GetCartAsync(guestId, cancellationToken);
            var item = cart.Items.FirstOrDefault(i => i.ProductId == productId);

            if (item != null)
            {
                cart.Items.Remove(item);
            }

            await SaveAsync(guestId, Recalculate(cart), cancellationToken);
            return cart;
        }

        public async Task<CartDto> ClearCartAsync(string guestId, CancellationToken cancellationToken = default)
        {
            var cart = new CartDto();
            await SaveAsync(guestId, cart, cancellationToken);
            return cart;
        }

        public async Task<CartDto> ApplyPromoCodeAsync(string guestId, string code, CancellationToken cancellationToken = default)
        {
            var cart = await GetCartAsync(guestId, cancellationToken);

            if (string.Equals(code, "WELCOME10", StringComparison.OrdinalIgnoreCase))
            {
                cart.Discount = cart.Subtotal * 0.1m;
            }
            else if (string.Equals(code, "FREESHIP", StringComparison.OrdinalIgnoreCase))
            {
                cart.Discount = 0;
            }
            else
            {
                throw new InvalidOperationException("Ma giam gia khong hop le.");
            }

            cart.ShippingCost = _shippingCalculator.CalculateShippingCost(cart.Subtotal, code);
            cart.Total = cart.Subtotal + cart.ShippingCost - cart.Discount;
            await SaveAsync(guestId, cart, cancellationToken);
            return cart;
        }

        public async Task DeleteCartAsync(string guestId, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(guestId))
            {
                return;
            }

            await _cache.RemoveAsync(GetKey(guestId), cancellationToken);
        }

        private async Task SaveAsync(string guestId, CartDto cart, CancellationToken cancellationToken)
        {
            try
            {
                var payload = JsonSerializer.Serialize(cart, JsonOptions);
                await _cache.SetStringAsync(
                    GetKey(guestId),
                    payload,
                    new DistributedCacheEntryOptions
                    {
                        AbsoluteExpirationRelativeToNow = TimeSpan.FromDays(_cacheConfig.GuestCartExpirationDays),
                        SlidingExpiration = TimeSpan.FromDays(1)
                    },
                    cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to save guest cart {GuestId} to Redis", guestId);
            }
        }

        private CartDto Recalculate(CartDto cart)
        {
            cart.Subtotal = cart.Items.Sum(i => i.Price * i.Quantity);
            cart.ShippingCost = _shippingCalculator.CalculateShippingCost(cart.Subtotal);
            cart.Discount = 0;
            cart.Total = cart.Subtotal + cart.ShippingCost;
            return cart;
        }

        private static string GetKey(string guestId)
        {
            return $"cart:guest:{guestId}";
        }
    }
}

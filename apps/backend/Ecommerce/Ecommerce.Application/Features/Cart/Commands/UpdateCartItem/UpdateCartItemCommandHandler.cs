using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Cart.Dto;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Domain.Services;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Application.Features.Cart.Commands.UpdateCartItem
{
    public class UpdateCartItemCommandHandler : IRequestHandler<UpdateCartItemCommand, Result<CartDto>>
    {
        private readonly IUnitOfWork _unitofwork;
        private readonly ICurrentUserService _currentUserService;
        private readonly IShippingCalculator _shippingCalculator;

        public UpdateCartItemCommandHandler(
            IUnitOfWork unitofwork, 
            ICurrentUserService currentUserService,
            IShippingCalculator shippingCalculator)
        {
            _unitofwork = unitofwork;
            _currentUserService = currentUserService;
            _shippingCalculator = shippingCalculator;
        }

        public async Task<Result<CartDto>> Handle(UpdateCartItemCommand request, CancellationToken cancellationToken)
        {
            // Validate that we have either UserId or GuestId
            if (_currentUserService.UserId == null && string.IsNullOrEmpty(_currentUserService.GuestId))
            {
                throw new Exception("Vui lòng đăng nhập hoặc cung cấp Guest ID.");
            }

            Domain.Entities.Cart? cart = null;

            // Get cart by UserId or GuestId
            if (_currentUserService.UserId != null)
            {
                cart = await _unitofwork.Carts.GetCartAsync(_currentUserService.UserId.Value, cancellationToken);
            }
            else if (!string.IsNullOrEmpty(_currentUserService.GuestId))
            {
                cart = await _unitofwork.Carts
                    .GetQueryable()
                    .Include(c => c.CartItems)
                        .ThenInclude(i => i.Product)
                    .FirstOrDefaultAsync(c => c.AnonymousId == _currentUserService.GuestId, cancellationToken);
            }

            if (cart == null)
            {
                throw new Exception("Không tìm thấy giỏ hàng.");
            }

            cart!.UpdateQuantity(request.ItemId, request.Quantity);

            // FORCE UPDATE: Explicitly mark the item as modified to ensure persistence
            // logic finds the item again (it must exist since UpdateQuantity didn't throw)
            var itemToUpdate = cart.CartItems.FirstOrDefault(i => i.ProductId == request.ItemId);
            if (itemToUpdate != null)
            {
                _unitofwork.BaseRepository<CartItem>().Update(itemToUpdate);
            }

            // Calculate shipping cost using business rules
            var shippingCost = _shippingCalculator.CalculateShippingCost(cart.Subtotal, cart.PromoCode);
            cart.SetShippingCost(shippingCost);

            await _unitofwork.CompleteAsync(cancellationToken);

            return Result<CartDto>.Success(new CartDto
            {
                Items = cart!.CartItems.Select(i => new CartItemDto
                {
                    CartId = i.CartId,
                    ProductId = i.ProductId,
                    Name = i.Product.Name,
                    Price = i.Product.SalePrice ?? i.Product.Price,
                    Quantity = i.Quantity,
                    Image = i.Product.Image,
                    Color = i.Color,
                    Size = i.Size
                }).ToList(),
                Subtotal = cart.Subtotal,
                ShippingCost = cart.ShippingCost,
                Discount = cart.Discount,
                Total = cart.Total
            });
        }
    }
}


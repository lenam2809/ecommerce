using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Cart.Dto;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Domain.Services;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Application.Features.Cart.Commands.RemoveCartItem
{
    public class RemoveCartItemCommandHandler : IRequestHandler<RemoveCartItemCommand, Result<CartDto>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICurrentUserService _currentUserService;
        private readonly IShippingCalculator _shippingCalculator;
        private readonly IGuestCartService _guestCartService;

        public RemoveCartItemCommandHandler(
            IUnitOfWork unitOfWork, 
            ICurrentUserService currentUserService,
            IShippingCalculator shippingCalculator,
            IGuestCartService guestCartService)
        {
            _unitOfWork = unitOfWork;
            _currentUserService = currentUserService;
            _shippingCalculator = shippingCalculator;
            _guestCartService = guestCartService;
        }

        public async Task<Result<CartDto>> Handle(RemoveCartItemCommand request, CancellationToken cancellationToken)
        {
            // Validate that we have either UserId or GuestId
            if (_currentUserService.UserId == null && string.IsNullOrEmpty(_currentUserService.GuestId))
            {
                throw new Exception("Vui lòng đăng nhập hoặc cung cấp Guest ID.");
            }

            if (_currentUserService.UserId == null && !string.IsNullOrEmpty(_currentUserService.GuestId))
            {
                var guestCart = await _guestCartService.RemoveItemAsync(
                    _currentUserService.GuestId,
                    request.ItemId,
                    cancellationToken);

                return Result<CartDto>.Success(guestCart);
            }

            Domain.Entities.Cart? cart = null;

            // Get cart by UserId or GuestId
            if (_currentUserService.UserId != null)
            {
                cart = await _unitOfWork.Carts.GetCartAsync(_currentUserService.UserId.Value, cancellationToken);
            }
            else if (!string.IsNullOrEmpty(_currentUserService.GuestId))
            {
                cart = await _unitOfWork.Carts
                    .GetQueryable()
                    .Include(c => c.CartItems)
                        .ThenInclude(i => i.Product)
                    .FirstOrDefaultAsync(c => c.AnonymousId == _currentUserService.GuestId, cancellationToken);
            }
            
            if (cart == null)
            {
                throw new Exception("Không tìm thấy giỏ hàng.");
            }

            cart!.RemoveItem(request.ItemId);

            // Calculate shipping cost using business rules
            var shippingCost = _shippingCalculator.CalculateShippingCost(cart.Subtotal, cart.PromoCode);
            cart.SetShippingCost(shippingCost);

            await _unitOfWork.CompleteAsync(cancellationToken);

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


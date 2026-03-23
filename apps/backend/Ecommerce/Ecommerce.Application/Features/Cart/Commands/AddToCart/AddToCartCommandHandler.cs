using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Cart.Dto;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Domain.Services;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Application.Features.Cart.Commands.AddToCart
{
    public class AddToCartCommandHandler : IRequestHandler<AddToCartCommand, Result<CartDto>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICurrentUserService _currentUserService;
        private readonly IShippingCalculator _shippingCalculator;

        public AddToCartCommandHandler(
            IUnitOfWork unitOfWork, 
            ICurrentUserService currentUserService,
            IShippingCalculator shippingCalculator)
        {
            _unitOfWork = unitOfWork;
            _currentUserService = currentUserService;
            _shippingCalculator = shippingCalculator;
        }

        public async Task<Result<CartDto>> Handle(AddToCartCommand request, CancellationToken cancellationToken)
        {
            // Validate that we have either UserId or GuestId
            if (_currentUserService.UserId == null && string.IsNullOrEmpty(_currentUserService.GuestId))
            {
                return Result<CartDto>.Unauthorized("Vui lòng đăng nhập hoặc cung cấp Guest ID.");
            }

            var product = await _unitOfWork.Products
                .FirstOrDefaultAsync(p => p.Id == request.ProductId, cancellationToken);

            if (product == null)
            {
                throw new Exception($"Không tìm thấy sản phẩm với ID {request.ProductId}");
            }

            Domain.Entities.Cart? cartNullable = null;

            // Try to get existing cart
            if (_currentUserService.UserId != null)
            {
                cartNullable = await _unitOfWork.Carts.GetCartAsync(_currentUserService.UserId.Value, cancellationToken);
            }
            else if (!string.IsNullOrEmpty(_currentUserService.GuestId))
            {
                cartNullable = await _unitOfWork.Carts
                    .GetQueryable()
                    .Include(c => c.CartItems)
                        .ThenInclude(i => i.Product)
                    .FirstOrDefaultAsync(c => c.AnonymousId == _currentUserService.GuestId, cancellationToken);
            }

            // Create new cart if not exists
            Domain.Entities.Cart cart;
            if (cartNullable == null)
            {
                if (_currentUserService.UserId != null)
                {
                    cart = new Domain.Entities.Cart(_currentUserService.UserId.Value);
                }
                else
                {
                    cart = new Domain.Entities.Cart(_currentUserService.GuestId!);
                }

                await _unitOfWork.Carts.AddAsync(cart);
            }
            else
            {
                cart = cartNullable;
            }

            cart.AddItem(product, request.Quantity, request.Color, request.Size);

            // Calculate shipping cost using business rules
            var shippingCost = _shippingCalculator.CalculateShippingCost(cart.Subtotal, cart.PromoCode);
            cart.SetShippingCost(shippingCost);

            await _unitOfWork.CompleteAsync(cancellationToken);

            // Return the updated cart
            return Result<CartDto>.Success(new CartDto
            {
                Items = cart.CartItems.Select(i => new CartItemDto
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


using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Cart.Dto;
using Ecommerce.Domain.Interfaces;
using MediatR;

namespace Ecommerce.Application.Features.Cart.Commands.ApplyPromoCode
{
    public class ApplyPromoCodeCommand : IRequest<Result<CartDto>>
    {
        public required string Code { get; set; }
    }

    public class ApplyPromoCodeCommandHandler : IRequestHandler<ApplyPromoCodeCommand, Result<CartDto>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICurrentUserService _currentUserService;

        public ApplyPromoCodeCommandHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUserService)
        {
            _unitOfWork = unitOfWork;
            _currentUserService = currentUserService;
        }

        public async Task<Result<CartDto>> Handle(ApplyPromoCodeCommand request, CancellationToken cancellationToken)
        {
            if (_currentUserService.UserId == null)
            {
                Result<CartDto>.Unauthorized("Người dùng chưa đăng nhập.");
            }

            var cart = await _unitOfWork.Carts.GetCartAsync(_currentUserService.UserId.Value, cancellationToken);

            if (cart == null)
            {
                Result<CartDto>.NotFound("Không tìm thấy giỏ hàng.");
            }

            // In a real application, you would validate the promo code against a database
            // For this example, let's assume a simple validation
            decimal discountAmount = 0;

            if (request.Code == "WELCOME10")
            {
                discountAmount = cart.Subtotal * 0.1m; // 10% discount
            }
            else if (request.Code == "FREESHIP")
            {
                // Handled in Domain
            }
            else
            {
                return Result<CartDto>.BadRequest("Mã giảm giá không hợp lệ.");
            }

            cart.ApplyPromoCode(request.Code, discountAmount);

            await _unitOfWork.CompleteAsync(cancellationToken);

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


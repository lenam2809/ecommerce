using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Cart.Dto;
using Ecommerce.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Application.Features.Cart.Commands.ClearCart
{
    public class ClearCartCommandHandler : IRequestHandler<ClearCartCommand, Result<CartDto>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICurrentUserService _currentUserService;
        private readonly IGuestCartService _guestCartService;

        public ClearCartCommandHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUserService, IGuestCartService guestCartService)
        {
            _unitOfWork = unitOfWork;
            _currentUserService = currentUserService;
            _guestCartService = guestCartService;
        }

        public async Task<Result<CartDto>> Handle(ClearCartCommand request, CancellationToken cancellationToken)
        {
            // Validate that we have either UserId or GuestId
            if (_currentUserService.UserId == null && string.IsNullOrEmpty(_currentUserService.GuestId))
            {
                throw new Exception("Vui lòng đăng nhập hoặc cung cấp Guest ID.");
            }

            if (_currentUserService.UserId == null && !string.IsNullOrEmpty(_currentUserService.GuestId))
            {
                return Result<CartDto>.Success(await _guestCartService.ClearCartAsync(_currentUserService.GuestId, cancellationToken));
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

            cart!.Clear();

            await _unitOfWork.CompleteAsync(cancellationToken);

            return Result<CartDto>.Success(new CartDto
            {
                Items = new List<CartItemDto>(),
                Subtotal = 0,
                ShippingCost = 0,
                Discount = 0,
                Total = 0
            });
        }
    }
}


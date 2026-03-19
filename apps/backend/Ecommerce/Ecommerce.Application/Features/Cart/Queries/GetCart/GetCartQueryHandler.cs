using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Cart.Dto;
using Ecommerce.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Application.Features.Cart.Queries.GetCart
{
    public class GetCartQueryHandler : IRequestHandler<GetCartQuery, Result<CartDto>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICurrentUserService _currentUserService;
        private readonly IFileStorageService _fileStorageService;

        public GetCartQueryHandler(IUnitOfWork unitOfWork,
            ICurrentUserService currentUserService,
            IFileStorageService fileStorageService)
        {
            _unitOfWork = unitOfWork;
            _currentUserService = currentUserService;
            _fileStorageService = fileStorageService;
        }

        public async Task<Result<CartDto>> Handle(GetCartQuery request, CancellationToken cancellationToken)
        {
            try
            {
                Domain.Entities.Cart? cart = null;

                // Check authenticated user first
                if (_currentUserService.UserId != null)
                {
                    cart = await _unitOfWork.Carts.GetCartAsync(_currentUserService.UserId.Value, cancellationToken);
                }
                // If not authenticated, check for guest ID
                else if (!string.IsNullOrEmpty(_currentUserService.GuestId))
                {
                    cart = await _unitOfWork.Carts
                        .GetQueryable()
                        .Include(c => c.CartItems)
                            .ThenInclude(i => i.Product)
                        .FirstOrDefaultAsync(c => c.AnonymousId == _currentUserService.GuestId, cancellationToken);
                }

                // Return empty cart if no cart found
                if (cart == null)
                {
                    return Result<CartDto>.Success(new CartDto());
                }

                var result = new CartDto
                {
                    Items = [.. cart.CartItems.Select(i => new CartItemDto
                    {
                        CartId = i.CartId,
                        ProductId = i.ProductId,
                        Name = i.Product.Name,
                        Price = i.Product.SalePrice ?? i.Product.Price,
                        Quantity = i.Quantity,
                        Image = _fileStorageService.GetFileUrlAsync(i.Product.Image).Result,
                        Color = i.Color ?? string.Empty,
                        Size = i.Size ?? string.Empty
                    })],
                    Subtotal = cart.Subtotal,
                    ShippingCost = cart.ShippingCost,
                    Discount = cart.Discount,
                    Total = cart.Total
                };

                return Result<CartDto>.Success(result);
            }
            catch (Exception ex)
            {
                return Result<CartDto>.BadRequest(ex.Message);
            }
        }
    }
}


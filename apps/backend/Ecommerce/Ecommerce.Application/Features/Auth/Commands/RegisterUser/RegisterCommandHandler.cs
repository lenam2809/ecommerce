using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Events;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Domain.Interfaces.Logging;
using MediatR;

namespace Ecommerce.Application.Features.Auth.Commands.RegisterUser
{
    public class RegisterCommandHandler : IRequestHandler<RegisterCommand, Result<Guid>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IPublisher _publisher;
        private readonly IEnhancedLogger _logger;

        public RegisterCommandHandler(IUnitOfWork unitOfWork,
            IPublisher publisher,
            IEnhancedLogger logger)
        {
            _unitOfWork = unitOfWork;
            _publisher = publisher;
            _logger = logger;
        }

        public async Task<Result<Guid>> Handle(RegisterCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var existingUser = await _unitOfWork.Users.GetByEmailAsync(request.Email);
                if (existingUser != null)
                {
                    return Result<Guid>.BadRequest("Email đã được sử dụng.");
                }

                //check mật khẩu với confirm password
                if (request.Password != request.ConfirmPassword)
                {
                    return Result<Guid>.BadRequest("Mật khẩu và xác nhận mật khẩu không khớp.");
                }

                var user = new ApplicationUser
                {
                    UserName = request.Email,
                    Email = request.Email,
                    EmailConfirmed = true,
                    PhoneNumber = request.PhoneNumber,
                    FirstName = request.FirstName,
                    LastName = request.LastName,
                    FullName = $"{request.FirstName} {request.LastName}",
                    CustomerLevel = ECustomerLevel.Bronze,
                    PromotionPoints = 0
                };

                var result = await _unitOfWork.Users.AddAsync(user, request.Password);
                if (result == null)
                {
                    return Result<Guid>.BadRequest("Không thể đăng ký người dùng.");
                }

                // Tạo giỏ hàng mới cho người dùng
                var cart = new Ecommerce.Domain.Entities.Cart(user.Id);

                await _unitOfWork.Carts.AddAsync(cart, cancellationToken);

                // Tạo giỏ hàng mới cho người dùng
                var wishlist = new Ecommerce.Domain.Entities.Wishlist
                {
                    ApplicationUserId = user.Id,
                    WishlistItems = [],

                };

                await _unitOfWork.Wishlists.AddAsync(wishlist, cancellationToken);

                // By default, all new registrations are Customers
                await _unitOfWork.Users.AddToRoleAsync(user, EUserRoles.Customer);
                await _unitOfWork.CompleteAsync(cancellationToken);

                // Publish event
                await _publisher.Publish(new UserRegisteredEvent(
                    user.Id,
                    user.Email,
                    user.FirstName,
                    user.LastName,
                    EUserRoles.Customer
                ), cancellationToken);

                await _logger.LogAsync(ELogLevel.Information,
                   "User registered successfully with role {RoleName}",
                   "RegisterSuccess",
                   ELogType.Security,
                   new Dictionary<string, object?>
                   {
                       { "UserId", user.Id },
                       { "RoleName", EUserRoles.Customer }
                   });

                return Result<Guid>.Success(user.Id);
            }
            catch (Exception ex)
            {
                await _logger.LogExceptionAsync(ex, "Đã xảy ra lỗi khi đăng ký");
                await _logger.LogAsync(
                    ELogLevel.Warning,
                    "User registration failed",
                    "RegisterFailed",
                    ELogType.Security);
                return Result<Guid>.BadRequest($"Lỗi khi đăng ký: {ex.Message}");
            }

        }
    }
}


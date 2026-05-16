using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Authorization;

namespace Ecommerce.Application.Features.CustomerAddresses.Queries.SetDefaultAddress
{
    [Authorize]
    public class SetDefaultAddressCommandHandler : IRequestHandler<SetDefaultAddressCommand, Result<Unit>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICurrentUserService _currentUserService;

        public SetDefaultAddressCommandHandler(
            IUnitOfWork unitOfWork,
            ICurrentUserService currentUserService)
        {
            _unitOfWork = unitOfWork;
            _currentUserService = currentUserService;
        }

        public async Task<Result<Unit>> Handle(SetDefaultAddressCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var currentUserId = _currentUserService.UserId;
                if (!currentUserId.HasValue)
                {
                    return Result<Unit>.Unauthorized();
                }

                var address = await _unitOfWork.CustomerAddresses.GetByIdAsync(request.AddressId, cancellationToken);
                if (address == null)
                {
                    return Result<Unit>.NotFound("Địa chỉ không tồn tại");
                }

                if (address.ApplicationUserId != currentUserId.Value)
                {
                    return Result<Unit>.Forbidden("Bạn không có quyền thao tác với địa chỉ này");
                }

                var success = await _unitOfWork.CustomerAddresses.SetDefaultAddressAsync(request.AddressId, currentUserId.Value, cancellationToken);
                if (!success)
                {
                    return Result<Unit>.BadRequest("Không thể đặt địa chỉ làm mặc định");
                }

                await _unitOfWork.CompleteAsync(cancellationToken);
                return Result<Unit>.Success(Unit.Value);
            }
            catch (Exception ex)
            {
                return Result<Unit>.BadRequest($"Lỗi khi đặt địa chỉ mặc định: {ex.Message}");
            }
        }
    }
}

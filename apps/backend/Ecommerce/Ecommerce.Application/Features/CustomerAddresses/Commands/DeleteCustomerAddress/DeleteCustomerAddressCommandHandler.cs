using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Authorization;

namespace Ecommerce.Application.Features.CustomerAddresses.Commands.DeleteCustomerAddress
{
    [Authorize]
    public class DeleteCustomerAddressCommandHandler : IRequestHandler<DeleteCustomerAddressCommand, Result<Unit>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICurrentUserService _currentUserService;

        public DeleteCustomerAddressCommandHandler(
            IUnitOfWork unitOfWork,
            ICurrentUserService currentUserService)
        {
            _unitOfWork = unitOfWork;
            _currentUserService = currentUserService;
        }

        public async Task<Result<Unit>> Handle(DeleteCustomerAddressCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var currentUserId = _currentUserService.UserId;
                if (!currentUserId.HasValue)
                {
                    return Result<Unit>.Unauthorized();
                }

                var address = await _unitOfWork.CustomerAddresses.GetByIdAsync(request.Id, cancellationToken);
                if (address == null)
                {
                    return Result<Unit>.NotFound("Địa chỉ không tồn tại");
                }

                if (address.ApplicationUserId != currentUserId.Value)
                {
                    return Result<Unit>.Forbidden("Bạn không có quyền xóa địa chỉ này");
                }

                var isDefault = address.IsDefault;
                _unitOfWork.CustomerAddresses.Delete(address);

                if (isDefault)
                {
                    var remainingAddresses = await _unitOfWork.CustomerAddresses.GetByUserIdAsync(currentUserId.Value, cancellationToken);
                    if (remainingAddresses.Any())
                    {
                        var firstAddress = remainingAddresses.First();
                        firstAddress.IsDefault = true;
                        _unitOfWork.CustomerAddresses.Update(firstAddress);
                    }
                }

                await _unitOfWork.CompleteAsync(cancellationToken);
                return Result<Unit>.Success(Unit.Value);
            }
            catch (Exception ex)
            {
                return Result<Unit>.BadRequest($"Lỗi khi xóa địa chỉ: {ex.Message}");
            }
        }
    }
}

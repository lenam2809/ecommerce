using AutoMapper;
using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Authorization;

namespace Ecommerce.Application.Features.CustomerAddresses.Commands.UpdateCustomerAddress
{
    [Authorize]
    public class UpdateCustomerAddressCommandHandler : IRequestHandler<UpdateCustomerAddressCommand, Result<Unit>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ICurrentUserService _currentUserService;

        public UpdateCustomerAddressCommandHandler(
            IUnitOfWork unitOfWork,
            IMapper mapper,
            ICurrentUserService currentUserService)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _currentUserService = currentUserService;
        }

        public async Task<Result<Unit>> Handle(UpdateCustomerAddressCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var currentUserId = _currentUserService.UserId;
                if (!currentUserId.HasValue)
                {
                    return Result<Unit>.Unauthorized();
                }

                var existingAddress = await _unitOfWork.CustomerAddresses.GetByIdAsync(request.Id, cancellationToken);
                if (existingAddress == null)
                {
                    return Result<Unit>.NotFound("Địa chỉ không tồn tại");
                }

                if (existingAddress.ApplicationUserId != currentUserId.Value)
                {
                    return Result<Unit>.Forbidden("Bạn không có quyền cập nhật địa chỉ này");
                }

                request.ApplicationUserId = currentUserId.Value;

                if (request.IsDefault && !existingAddress.IsDefault)
                {
                    await _unitOfWork.CustomerAddresses.SetDefaultAddressAsync(request.Id, currentUserId.Value, cancellationToken);
                }

                _mapper.Map(request, existingAddress);
                _unitOfWork.CustomerAddresses.Update(existingAddress);
                await _unitOfWork.CompleteAsync(cancellationToken);

                return Result<Unit>.Success(Unit.Value);
            }
            catch (Exception ex)
            {
                return Result<Unit>.BadRequest($"Lỗi khi cập nhật địa chỉ: {ex.Message}");
            }
        }
    }
}

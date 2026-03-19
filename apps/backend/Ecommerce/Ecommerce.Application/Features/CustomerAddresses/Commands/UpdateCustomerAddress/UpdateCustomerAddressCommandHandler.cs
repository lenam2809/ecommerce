using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Interfaces;
using AutoMapper;
using MediatR;
using Microsoft.AspNetCore.Authorization;

namespace Ecommerce.Application.Features.CustomerAddresses.Commands.UpdateCustomerAddress
{
    [Authorize]
    public class UpdateCustomerAddressCommandHandler : IRequestHandler<UpdateCustomerAddressCommand, Result<Unit>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public UpdateCustomerAddressCommandHandler(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<Result<Unit>> Handle(UpdateCustomerAddressCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var existingAddress = await _unitOfWork.CustomerAddresses.GetByIdAsync(request.Id, cancellationToken);
                if (existingAddress == null)
                {
                    return Result<Unit>.NotFound("Địa chỉ không tồn tại");
                }

                // Check ownership
                if (existingAddress.ApplicationUserId != request.ApplicationUserId)
                {
                    return Result<Unit>.Forbidden("Bạn không có quyền cập nhật địa chỉ này");
                }

                // If setting as default, update other addresses
                if (request.IsDefault && !existingAddress.IsDefault)
                {
                    await _unitOfWork.CustomerAddresses.SetDefaultAddressAsync(request.Id, request.ApplicationUserId, cancellationToken);
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


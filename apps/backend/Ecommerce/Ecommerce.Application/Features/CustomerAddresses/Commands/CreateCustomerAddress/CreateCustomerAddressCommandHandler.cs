using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces;
using AutoMapper;
using MediatR;

namespace Ecommerce.Application.Features.CustomerAddresses.Commands.CreateCustomerAddress
{
    public class CreateCustomerAddressCommandHandler : IRequestHandler<CreateCustomerAddressCommand, Result<Guid>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public CreateCustomerAddressCommandHandler(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<Result<Guid>> Handle(CreateCustomerAddressCommand request, CancellationToken cancellationToken)
        {
            try
            {
                // Check if this is the first address for the user, make it default
                var existingAddressCount = await _unitOfWork.CustomerAddresses.CountByUserIdAsync(request.ApplicationUserId, cancellationToken);
                if (existingAddressCount == 0)
                {
                    request.IsDefault = true;
                }

                // If this is set as default, update other addresses
                if (request.IsDefault)
                {
                    await _unitOfWork.CustomerAddresses.SetDefaultAddressAsync(Guid.Empty, request.ApplicationUserId, cancellationToken);
                }

                var customerAddress = _mapper.Map<CustomerAddress>(request);
                var addedAddress = await _unitOfWork.CustomerAddresses.AddAsync(customerAddress, cancellationToken);
                await _unitOfWork.CompleteAsync(cancellationToken);

                return Result<Guid>.Success(addedAddress.Id);
            }
            catch (Exception ex)
            {
                return Result<Guid>.BadRequest($"Lỗi khi tạo địa chỉ: {ex.Message}");
            }
        }
    }
}


using AutoMapper;
using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces;
using MediatR;

namespace Ecommerce.Application.Features.CustomerAddresses.Commands.CreateCustomerAddress
{
    public class CreateCustomerAddressCommandHandler : IRequestHandler<CreateCustomerAddressCommand, Result<Guid>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ICurrentUserService _currentUserService;

        public CreateCustomerAddressCommandHandler(
            IUnitOfWork unitOfWork,
            IMapper mapper,
            ICurrentUserService currentUserService)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _currentUserService = currentUserService;
        }

        public async Task<Result<Guid>> Handle(CreateCustomerAddressCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var currentUserId = _currentUserService.UserId;
                if (!currentUserId.HasValue)
                {
                    return Result<Guid>.Unauthorized();
                }

                request.ApplicationUserId = currentUserId.Value;

                var existingAddressCount = await _unitOfWork.CustomerAddresses.CountByUserIdAsync(request.ApplicationUserId, cancellationToken);
                if (existingAddressCount == 0)
                {
                    request.IsDefault = true;
                }

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

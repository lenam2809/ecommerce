using AutoMapper;
using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.CustomerAddresses.Dto;
using Ecommerce.Domain.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Authorization;

namespace Ecommerce.Application.Features.CustomerAddresses.Queries.GetCustomerAddresses
{
    [Authorize]
    public class GetCustomerAddressesQueryHandler : IRequestHandler<GetCustomerAddressesQuery, Result<List<CustomerAddressDto>>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ICurrentUserService _currentUserService;

        public GetCustomerAddressesQueryHandler(
            IUnitOfWork unitOfWork,
            IMapper mapper,
            ICurrentUserService currentUserService)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _currentUserService = currentUserService;
        }

        public async Task<Result<List<CustomerAddressDto>>> Handle(GetCustomerAddressesQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var currentUserId = _currentUserService.UserId;
                if (!currentUserId.HasValue)
                {
                    return Result<List<CustomerAddressDto>>.Unauthorized();
                }

                var addresses = await _unitOfWork.CustomerAddresses.GetByUserIdAsync(currentUserId.Value, cancellationToken);
                var addressDtos = _mapper.Map<List<CustomerAddressDto>>(addresses);

                return Result<List<CustomerAddressDto>>.Success(addressDtos);
            }
            catch (Exception ex)
            {
                return Result<List<CustomerAddressDto>>.BadRequest($"Lỗi khi lấy danh sách địa chỉ: {ex.Message}");
            }
        }
    }
}

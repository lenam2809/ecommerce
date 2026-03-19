using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.CustomerAddresses.Dto;
using Ecommerce.Domain.Interfaces;
using AutoMapper;
using MediatR;
using Microsoft.AspNetCore.Authorization;

namespace Ecommerce.Application.Features.CustomerAddresses.Queries.GetCustomerAddresses
{
    [Authorize]
    public class GetCustomerAddressesQueryHandler : IRequestHandler<GetCustomerAddressesQuery, Result<List<CustomerAddressDto>>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public GetCustomerAddressesQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<Result<List<CustomerAddressDto>>> Handle(GetCustomerAddressesQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var addresses = await _unitOfWork.CustomerAddresses.GetByUserIdAsync(request.ApplicationUserId, cancellationToken);
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


using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.CustomerAddresses.Dto;
using Ecommerce.Domain.Interfaces;
using AutoMapper;
using MediatR;
using Microsoft.AspNetCore.Authorization;

namespace Ecommerce.Application.Features.CustomerAddresses.Queries.GetCustomerAddressById
{
    [Authorize]
    public class GetCustomerAddressByIdQueryHandler : IRequestHandler<GetCustomerAddressByIdQuery, Result<CustomerAddressDto>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public GetCustomerAddressByIdQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<Result<CustomerAddressDto>> Handle(GetCustomerAddressByIdQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var address = await _unitOfWork.CustomerAddresses.GetByIdAsync(request.Id, cancellationToken);
                if (address == null)
                {
                    return Result<CustomerAddressDto>.NotFound("Địa chỉ không tồn tại");
                }

                // Check ownership
                if (address.ApplicationUserId != request.ApplicationUserId)
                {
                    return Result<CustomerAddressDto>.Forbidden("Bạn không có quyền truy cập địa chỉ này");
                }

                var addressDto = _mapper.Map<CustomerAddressDto>(address);
                return Result<CustomerAddressDto>.Success(addressDto);
            }
            catch (Exception ex)
            {
                return Result<CustomerAddressDto>.BadRequest($"Lỗi khi lấy thông tin địa chỉ: {ex.Message}");
            }
        }
    }
}


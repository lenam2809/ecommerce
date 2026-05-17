using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Permissions.Dto;
using Ecommerce.Domain.Interfaces;
using AutoMapper;
using MediatR;

namespace Ecommerce.Application.Features.Permissions.Queries.GetPermissionById
{
    public class GetPermissionByIdQueryHandler : IRequestHandler<GetPermissionByIdQuery, Result<PermissionDto>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public GetPermissionByIdQueryHandler(
            IUnitOfWork unitOfWork,
            IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<Result<PermissionDto>> Handle(GetPermissionByIdQuery request, CancellationToken cancellationToken)
        {
            // Lấy thông tin quyền từ repository theo ID
            var permission = await _unitOfWork.Permissions.GetByIdAsync(request.Id);

            // Kiểm tra nếu không tìm thấy quyền
            if (permission == null)
            {
                return Result<PermissionDto>.NotFound($"Không tìm thấy quyền với ID: {request.Id}");
            }

            // Map thành DTO và trả về kết quả
            var permissionDto = _mapper.Map<PermissionDto>(permission);

            return Result<PermissionDto>.Success(permissionDto);
        }
    }
}


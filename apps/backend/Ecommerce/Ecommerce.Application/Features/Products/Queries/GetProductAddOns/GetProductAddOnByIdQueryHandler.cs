using AutoMapper;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Products.Dto;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces;
using MediatR;

namespace Ecommerce.Application.Features.Products.Queries.GetProductAddOns
{
    public class GetProductAddOnByIdQueryHandler : IRequestHandler<GetProductAddOnByIdQuery, Result<ProductAddOnDto>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public GetProductAddOnByIdQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<Result<ProductAddOnDto>> Handle(GetProductAddOnByIdQuery request, CancellationToken cancellationToken)
        {
            var repository = _unitOfWork.BaseRepository<ProductAddOn>();
            var item = await repository.GetByIdAsync(request.Id, cancellationToken);

            if (item == null)
            {
                return Result<ProductAddOnDto>.NotFound($"Không tìm thấy gói dịch vụ với ID: {request.Id}");
            }

            var dto = _mapper.Map<ProductAddOnDto>(item);
            return Result<ProductAddOnDto>.Success(dto);
        }
    }
}

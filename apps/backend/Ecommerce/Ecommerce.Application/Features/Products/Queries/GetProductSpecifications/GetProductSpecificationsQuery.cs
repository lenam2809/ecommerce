using AutoMapper;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Products.Dto;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Application.Features.Products.Queries.GetProductSpecifications
{
    public class GetProductSpecificationsQuery : IRequest<Result<List<SpecificationDto>>>
    {
        public Guid ProductId { get; set; }
    }

    public class GetProductSpecificationsQueryHandler : IRequestHandler<GetProductSpecificationsQuery, Result<List<SpecificationDto>>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public GetProductSpecificationsQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<Result<List<SpecificationDto>>> Handle(GetProductSpecificationsQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var specs = await _unitOfWork.BaseRepository<ProductSpecification>()
                    .GetQueryable()
                    .AsNoTracking()
                    .Where(s => s.ProductId == request.ProductId)
                    .OrderBy(s => s.DisplayOrder)
                    .ToListAsync(cancellationToken);

                var dtos = _mapper.Map<List<SpecificationDto>>(specs);
                return Result<List<SpecificationDto>>.Success(dtos);
            }
            catch (Exception ex)
            {
                return Result<List<SpecificationDto>>.BadRequest($"Lỗi khi lấy thông số kỹ thuật: {ex.Message}");
            }
        }
    }
}

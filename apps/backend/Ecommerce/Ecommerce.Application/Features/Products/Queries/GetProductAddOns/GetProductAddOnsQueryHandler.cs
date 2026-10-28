using AutoMapper;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Products.Dto;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Application.Features.Products.Queries.GetProductAddOns
{
    public class GetProductAddOnsQueryHandler : IRequestHandler<GetProductAddOnsQuery, Result<List<ProductAddOnDto>>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public GetProductAddOnsQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<Result<List<ProductAddOnDto>>> Handle(GetProductAddOnsQuery request, CancellationToken cancellationToken)
        {
            var repository = _unitOfWork.BaseRepository<ProductAddOn>();
            var query = repository.GetQueryable(tracking: false);

            if (request.ProductId.HasValue)
            {
                query = query.Where(a => a.ProductId == request.ProductId.Value);
            }

            if (request.CategoryId.HasValue)
            {
                query = query.Where(a => a.CategoryId == request.CategoryId.Value);
            }

            if (request.BrandId.HasValue)
            {
                query = query.Where(a => a.BrandId == request.BrandId.Value);
            }

            if (!string.IsNullOrWhiteSpace(request.AddOnType))
            {
                query = query.Where(a => a.AddOnType == request.AddOnType);
            }

            if (request.IsActive.HasValue)
            {
                query = query.Where(a => a.IsActive == request.IsActive.Value);
            }

            var items = await query
                .OrderBy(a => a.DisplayOrder)
                .ThenBy(a => a.Name)
                .ToListAsync(cancellationToken);

            var dtos = _mapper.Map<List<ProductAddOnDto>>(items);
            return Result<List<ProductAddOnDto>>.Success(dtos);
        }
    }
}

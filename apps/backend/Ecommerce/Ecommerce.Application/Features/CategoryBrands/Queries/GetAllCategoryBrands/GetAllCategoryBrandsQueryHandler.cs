using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.CategoryBrands.Dto;
using Ecommerce.Domain.Interfaces;
using AutoMapper;
using MediatR;

namespace Ecommerce.Application.Features.CategoryBrands.Queries.GetAllCategoryBrands
{
    public class GetAllCategoryBrandsQueryHandler : IRequestHandler<GetAllCategoryBrandsQuery, Result<List<CategoryBrandDto>>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public GetAllCategoryBrandsQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<Result<List<CategoryBrandDto>>> Handle(GetAllCategoryBrandsQuery request, CancellationToken cancellationToken)
        {
            var categoryBrands = await _unitOfWork.CategoryBrands.GetAllAsync(cancellationToken);
            var categoryBrandDtos = _mapper.Map<List<CategoryBrandDto>>(categoryBrands);

            return Result<List<CategoryBrandDto>>.Success(categoryBrandDtos);
        }
    }
}


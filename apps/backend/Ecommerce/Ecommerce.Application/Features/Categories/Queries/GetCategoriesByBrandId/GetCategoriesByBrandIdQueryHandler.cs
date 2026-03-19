using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Categories.Dto;
using Ecommerce.Domain.Interfaces;
using AutoMapper;
using MediatR;

namespace Ecommerce.Application.Features.Categories.Queries.GetCategoriesByBrandId
{
    public class GetCategoriesByBrandIdQueryHandler : IRequestHandler<GetCategoriesByBrandIdQuery, Result<List<CategoryDto>>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IFileStorageService _fileStorageService;

        public GetCategoriesByBrandIdQueryHandler(IUnitOfWork unitOfWork, IMapper mapper, IFileStorageService fileStorageService)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _fileStorageService = fileStorageService;
        }

        public async Task<Result<List<CategoryDto>>> Handle(GetCategoriesByBrandIdQuery request, CancellationToken cancellationToken)
        {
            // Kiểm tra brand có tồn tại không
            var brandExists = await _unitOfWork.Brands.ExistsAsync(request.BrandId, cancellationToken);
            if (!brandExists)
            {
                return Result<List<CategoryDto>>.NotFound("Thương hiệu không tồn tại");
            }

            // Lấy danh sách CategoryBrand theo BrandId
            var categoryBrands = await _unitOfWork.CategoryBrands
                .FindAsync(cb => cb.BrandId == request.BrandId, cancellationToken);

            if (!categoryBrands.Any())
            {
                return Result<List<CategoryDto>>.Success([]);
            }

            // Lấy danh sách CategoryId
            var categoryIds = categoryBrands.Select(cb => cb.CategoryId).ToList();

            // Lấy danh sách Category
            var categories = await _unitOfWork.Categories
                .FindAsync(c => categoryIds.Contains(c.Id) && c.IsActive, cancellationToken);

            // Map sang CategoryDto
            var categoryDtos = _mapper.Map<List<CategoryDto>>(categories);

            // Chuyển đổi Image thành URL đầy đủ
            foreach (var categoryDto in categoryDtos)
            {
                if (!string.IsNullOrEmpty(categoryDto.Image))
                {
                    categoryDto.Image = await _fileStorageService.GetFileUrlAsync(categoryDto.Image);
                }
            }

            return Result<List<CategoryDto>>.Success(categoryDtos);
        }
    }
}


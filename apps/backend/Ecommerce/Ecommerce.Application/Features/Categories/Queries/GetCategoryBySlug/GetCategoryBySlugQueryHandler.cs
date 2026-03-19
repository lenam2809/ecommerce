using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Categories.Dto;
using Ecommerce.Application.Features.CategoryBrands.Queries.GetCategoryBrandsByCategoryId;
using Ecommerce.Domain.Interfaces;
using AutoMapper;
using MediatR;

namespace Ecommerce.Application.Features.Categories.Queries.GetCategoryBySlug
{
    public class GetCategoryBySlugQueryHandler : IRequestHandler<GetCategoryBySlugQuery, Result<CategoryDto>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IMediator _mediator;
        private readonly IFileStorageService _fileStorageService;

        public GetCategoryBySlugQueryHandler(IUnitOfWork unitOfWork, IMapper mapper, IMediator mediator, IFileStorageService fileStorageService)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _mediator = mediator;
            _fileStorageService = fileStorageService;
        }

        public async Task<Result<CategoryDto>> Handle(GetCategoryBySlugQuery request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(request.Slug))
            {
                return Result<CategoryDto>.BadRequest("Slug không được để trống");
            }

            // Lấy category theo slug
            var category = await _unitOfWork.Categories.FirstOrDefaultAsync(
                c => c.Slug.ToLower() == request.Slug.ToLower() && c.IsActive,
                cancellationToken);

            if (category == null)
            {
                return Result<CategoryDto>.NotFound("Không tìm thấy danh mục với slug này");
            }

            var categoryDto = _mapper.Map<CategoryDto>(category);

            // Chuyển đổi hình ảnh từ đường dẫn sang URL
            if (!string.IsNullOrEmpty(categoryDto.Image))
            {
                categoryDto.Image = await _fileStorageService.GetFileUrlAsync(categoryDto.Image);
            }

            // Lấy danh sách category con nếu được yêu cầu
            if (request.IncludeChildren)
            {
                var children = await _unitOfWork.Categories.FindAsync(
                    c => c.ParentId == category.Id && c.IsActive,
                    cancellationToken);

                categoryDto.Children = _mapper.Map<List<CategoryDto>>(children);

                // Chuyển đổi hình ảnh cho các category con
                foreach (var child in categoryDto.Children)
                {
                    if (!string.IsNullOrEmpty(child.Image))
                    {
                        child.Image = await _fileStorageService.GetFileUrlAsync(child.Image);
                    }
                }
            }

            // Lấy danh sách brands nếu được yêu cầu
            if (request.IncludeBrands)
            {
                var categoryBrandsResult = await _mediator.Send(new GetCategoryBrandsByCategoryIdQuery
                {
                    CategoryId = category.Id
                }, cancellationToken);

                if (categoryBrandsResult.IsSuccess)
                {
                    categoryDto.CategoryBrands = categoryBrandsResult.Value ?? [];
                    categoryDto.BrandIds = categoryDto.CategoryBrands.Select(cb => cb.BrandId).ToList();
                }
            }

            return Result<CategoryDto>.Success(categoryDto);
        }
    }
}


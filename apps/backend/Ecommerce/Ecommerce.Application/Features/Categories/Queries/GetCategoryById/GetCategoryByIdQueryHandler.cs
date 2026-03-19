using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Categories.Dto;
using Ecommerce.Application.Features.CategoryBrands.Queries.GetCategoryBrandsByCategoryId;
using Ecommerce.Domain.Interfaces;
using AutoMapper;
using MediatR;

namespace Ecommerce.Application.Features.Categories.Queries.GetCategoryById
{
    public class GetCategoryByIdQueryHandler : IRequestHandler<GetCategoryByIdQuery, Result<CategoryDto>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IFileStorageService _fileStorageService;
        private readonly IMediator _mediator;


        public GetCategoryByIdQueryHandler(IUnitOfWork unitOfWork,
            IMapper mapper,
            IFileStorageService fileStorageService,
            IMediator mediator)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _fileStorageService = fileStorageService;
            _mediator = mediator;
        }

        public async Task<Result<CategoryDto>> Handle(GetCategoryByIdQuery request, CancellationToken cancellationToken)
        {
            var category = await _unitOfWork.Categories.GetByIdAsync(request.Id, cancellationToken);

            if (category == null)
            {
                return Result<CategoryDto>.NotFound("Không tìm thấy danh mục.");
            }

            var categoryDto = _mapper.Map<CategoryDto>(category);
            categoryDto.Image = await _fileStorageService.GetFileUrlAsync(categoryDto.Image);
            categoryDto.Children = [];
            var childCategories = await _unitOfWork.Categories.FindAsync(c => c.ParentId == category.Id, cancellationToken);
            foreach (var child in childCategories)
            {
                var childDto = _mapper.Map<CategoryDto>(child);
                childDto.Image = await _fileStorageService.GetFileUrlAsync(childDto.Image);
                categoryDto.Children.Add(childDto);
            }

            // Lấy danh sách CategoryBrands
            var categoryBrandsResult = await _mediator.Send(new GetCategoryBrandsByCategoryIdQuery
            {
                CategoryId = request.Id
            }, cancellationToken);

            if (categoryBrandsResult.IsSuccess)
            {
                categoryDto.CategoryBrands = categoryBrandsResult.Value ?? [];
                categoryDto.BrandIds = [.. categoryDto.CategoryBrands.Select(cb => cb.BrandId)];
            }

            return Result<CategoryDto>.Success(categoryDto);
        }
    }
}


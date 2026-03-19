using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Categories.Dto;
using Ecommerce.Domain.Interfaces;
using AutoMapper;
using MediatR;

namespace Ecommerce.Application.Features.Categories.Queries.GetTopPopularCategories
{
    public class GetTopPopularCategoriesQueryHandler
        : IRequestHandler<GetTopPopularCategoriesQuery, Result<List<CategoryDto>>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IFileStorageService _fileStorageService;
        public GetTopPopularCategoriesQueryHandler(IUnitOfWork unitOfWork,
            IMapper mapper,
            IFileStorageService fileStorageService)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _fileStorageService = fileStorageService;
        }

        public async Task<Result<List<CategoryDto>>> Handle(
            GetTopPopularCategoriesQuery request,
            CancellationToken cancellationToken)
        {
            var topCategories = await _unitOfWork.Categories.GetTopCategoriesByPurchaseCount(
                request.Limit,
                cancellationToken);

            if (topCategories == null || topCategories.Count == 0)
            {
                return Result<List<CategoryDto>>.Success([]);
            }

            var categoriesDto = _mapper.Map<List<CategoryDto>>(topCategories);
            foreach (var categoryDto in categoriesDto)
            {
                categoryDto.Image = await _fileStorageService.GetFileUrlAsync(categoryDto.Image);
            }
            return Result<List<CategoryDto>>.Success(categoriesDto);
        }
    }
}


using Ecommerce.Application.Common.Constants;
using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Categories.Dto;
using Ecommerce.Domain.Interfaces;
using MediatR;

namespace Ecommerce.Application.Features.Categories.Queries.GetAllCategories
{
    public class GetAllCategoriesQueryHandler : IRequestHandler<GetAllCategoriesQuery, Result<List<CategoryDto>>>
    {
        private readonly ICategoryRepository _repository;
        private readonly IFileStorageService _fileStorageService;

        public GetAllCategoriesQueryHandler(ICategoryRepository repository,
            IFileStorageService fileStorageService)
        {
            _repository = repository;
            _fileStorageService = fileStorageService;
        }

        public async Task<Result<List<CategoryDto>>> Handle(GetAllCategoriesQuery request, CancellationToken cancellationToken)
        {
            try
            {
                // Get parent categories first
                var parentCategories = await _repository.FindAsync(c => c.ParentId == null, cancellationToken);

                // Get all categories to avoid multiple queries
                var allCategories = await _repository.GetAllAsync(cancellationToken);

                // Build the category hierarchy
                var result = parentCategories.Select(c => MapCategoryDto(c, allCategories.ToList())).ToList();

                // Map the image URLs
                foreach (var categoryDto in result)
                {
                    categoryDto.Image = await _fileStorageService.GetFileUrlAsync(categoryDto.Image);
                    foreach (var child in categoryDto.Children)
                    {
                        child.Image = await _fileStorageService.GetFileUrlAsync(child.Image);
                    }
                }

                return Result<List<CategoryDto>>.Success(result);
            }
            catch (Exception ex)
            {
                return Result<List<CategoryDto>>.BadRequest(ex.Message);
            }

        }

        private CategoryDto MapCategoryDto(Domain.Entities.Category category, List<Domain.Entities.Category> allCategories)
        {
            var dto = new CategoryDto
            {
                Id = category.Id,
                Code = category.Code,
                Name = category.Name,
                Image = category.Image,
                Slug = category.Slug,
                ParentId = category.ParentId,
                Children = [],
                ProductCount = category.Products.Count,
                Description = category.Description,
            };

            // Find all children of this category
            var children = allCategories.Where(c => c.ParentId == category.Id).ToList();

            if (children.Any())
            {
                foreach (var child in children)
                {
                    dto.Children.Add(MapCategoryDto(child, allCategories));
                }
            }

            return dto;
        }

    }
}


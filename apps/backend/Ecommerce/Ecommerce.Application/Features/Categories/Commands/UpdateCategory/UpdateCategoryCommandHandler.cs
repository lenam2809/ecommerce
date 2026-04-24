using Ecommerce.Application.Common.Constants;
using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Categories.Queries.GetCategoryById;
using Ecommerce.Application.Features.Categories.Queries.GetCategoryBySlug;
using Ecommerce.Application.Features.CategoryBrands.Commands.UpdateCategoryBrands;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Domain.Interfaces.Logging;
using AutoMapper;
using MediatR;
using Microsoft.AspNetCore.Authorization;

namespace Ecommerce.Application.Features.Categories.Commands.UpdateCategory
{
    [Authorize(Policy = EPermissions.EditProduct)]
    public class UpdateCategoryCommandHandler : IRequestHandler<UpdateCategoryCommand, Result<Guid>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IFileStorageService _fileStorageService;
        private readonly IEnhancedLogger _logger;
        private readonly IMapper _mapper;
        private readonly IMediator _mediator;
        private readonly ICacheInvalidationService _cacheInvalidationService;

        public UpdateCategoryCommandHandler(IUnitOfWork unitOfWork,
            IFileStorageService fileStorageService,
            IEnhancedLogger logger,
            IMapper mapper,
            IMediator mediator,
            ICacheInvalidationService cacheInvalidationService)
        {
            _unitOfWork = unitOfWork;
            _fileStorageService = fileStorageService;
            _logger = logger;
            _mapper = mapper;
            _mediator = mediator;
            _cacheInvalidationService = cacheInvalidationService;
        }

        public async Task<Result<Guid>> Handle(UpdateCategoryCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var category = await _unitOfWork.Categories.GetByIdAsync(request.Id, cancellationToken);
                if (category == null)
                {
                    return Result<Guid>.NotFound("Danh mục không tồn tại");
                }

                _mapper.Map(request, category);


                if (request.Image != null)
                {
                    string imagePath = await _fileStorageService.SaveFileAsync(
                        request.Image,
                        "categories");

                    if (!string.IsNullOrEmpty(category.Image))
                    {
                        await _fileStorageService.DeleteFileAsync(category.Image);
                    }

                    category.Image = imagePath;
                }

                _unitOfWork.Categories.Update(category);
                await _unitOfWork.CompleteAsync(cancellationToken);

                // Cập nhật liên kết với categories
                await _mediator.Send(new UpdateCategoryBrandsByCategoryIdCommand
                {
                    CategoryId = category.Id,
                    BrandIds = request.BrandIds ?? []
                }, cancellationToken);

                await _logger.LogAsync(
                    ELogLevel.Information,
                    "Category updated successfully for {CategoryId}",
                    "UpdateCategory",
                    properties: new Dictionary<string, object?>
                    {
                        { "CategoryId", category.Id }
                    });

                await _cacheInvalidationService.InvalidateCategoryCache(category.Id);

                return Result<Guid>.Success(category.Id);
            }
            catch (Exception ex)
            {
                await _logger.LogExceptionAsync(ex, "Đã xảy ra lỗi khi cập nhật danh mục");
                return Result<Guid>.BadRequest($"Lỗi khi cập nhật danh mục: {ex.Message}");
            }
        }
    }
}


using Ecommerce.Application.Common.Constants;
using Ecommerce.Application.Common.Helpers;
using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.CategoryBrands.Commands.CreateCategoryBrand;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Domain.Interfaces.Logging;
using AutoMapper;
using MediatR;

namespace Ecommerce.Application.Features.Categories.Commands.CreateCategory
{
    public class CreateCategoryCommandHandler : IRequestHandler<CreateCategoryCommand, Result<Guid>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IFileStorageService _fileStorageService;
        private readonly IEnhancedLogger _logger;
        private readonly IMapper _mapper;
        private readonly IMediator _mediator;
        private readonly ICacheService _cacheService;


        public CreateCategoryCommandHandler(IUnitOfWork unitOfWork,
            IFileStorageService fileStorageService,
            IEnhancedLogger logger,
            IMapper mapper,
            IMediator mediator,
            ICacheService cacheService)
        {
            _unitOfWork = unitOfWork;
            _fileStorageService = fileStorageService;
            _logger = logger;
            _mapper = mapper;
            _mediator = mediator;
            _cacheService = cacheService;
        }

        public async Task<Result<Guid>> Handle(CreateCategoryCommand request, CancellationToken cancellationToken)
        {
            try
            {
                // Tạo mới Category từ request
                var category = _mapper.Map<Category>(request);

                // Xử lý hình ảnh của danh mục
                if (request.Image != null)
                {
                    string imagePath = await _fileStorageService.SaveFileAsync(
                        request.Image,
                        "categories");

                    category.Image = imagePath;
                }
                category.Slug = SlugHelper.GenerateSlug(category.Name);

                // Lưu danh mục vào database
                var result = await _unitOfWork.Categories.AddAsync(category, cancellationToken);
                await _unitOfWork.CompleteAsync(cancellationToken);

                if (request.BrandIds != null && request.BrandIds.Count != 0)
                {
                    foreach (var brandId in request.BrandIds)
                    {
                        await _mediator.Send(new CreateCategoryBrandCommand
                        {
                            BrandId = brandId,
                            CategoryId = result.Id
                        }, cancellationToken);
                    }
                }
                await _logger.LogAsync(
                    ELogLevel.Information,
                    "Category created successfully for {CategoryId}",
                    "CreateCategory",
                    properties: new Dictionary<string, object?>
                    {
                        { "CategoryId", result.Id }
                    });

                // Xóa cache liên quan
                await _cacheService.RemoveAsync(CacheKeys.GetAllCategories()); // static key

                return Result<Guid>.Success(result.Id);
            }
            catch (Exception ex)
            {
                await _logger.LogExceptionAsync(ex, "Đã xảy ra lỗi khi tạo danh mục");
                return Result<Guid>.BadRequest($"Lỗi khi tạo danh mục: {ex.Message}");
            }
        }
    }
}


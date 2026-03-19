using Ecommerce.Application.Common.Constants;
using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Brands.Queries.GetBrandById;
using Ecommerce.Application.Features.Brands.Queries.GetBrandBySlug;
using Ecommerce.Application.Features.CategoryBrands.Commands.UpdateCategoryBrandsByBrandId;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Domain.Interfaces.Logging;
using AutoMapper;
using MediatR;

namespace Ecommerce.Application.Features.Brands.Commands.UpdateBrand
{
    public class UpdateBrandCommandHandler : IRequestHandler<UpdateBrandCommand, Result<bool>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IEnhancedLogger _logger;
        private readonly IFileStorageService _fileStorageService;
        private readonly IMediator _mediator;
        private readonly ICacheInvalidationService _cacheInvalidationService;



        public UpdateBrandCommandHandler(IUnitOfWork unitOfWork,
            IMapper mapper,
            IEnhancedLogger logger,
            IFileStorageService fileStorageService,
            IMediator mediator,
            ICacheInvalidationService cacheInvalidationService)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _logger = logger;
            _fileStorageService = fileStorageService;
            _mediator = mediator;
            _cacheInvalidationService = cacheInvalidationService;
        }

        public async Task<Result<bool>> Handle(UpdateBrandCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var brand = await _unitOfWork.Brands.GetByIdAsync(request.Id, cancellationToken);

                if (brand == null)
                {
                    return Result<bool>.NotFound("Thương hiệu không tồn tại");
                }

                _mapper.Map(request, brand);

                if (request.Logo != null)
                {
                    // Xóa hình ảnh cũ nếu có
                    if (!string.IsNullOrEmpty(brand.LogoUrl))
                    {
                        await _fileStorageService.DeleteFileAsync(brand.LogoUrl);
                    }

                    // Lưu hình ảnh mới
                    string imagePath = await _fileStorageService.SaveFileAsync(
                        request.Logo,
                        "brands");


                    brand.LogoUrl = imagePath;
                }


                _unitOfWork.Brands.Update(brand);
                await _unitOfWork.CompleteAsync(cancellationToken);

                // Cập nhật liên kết với categories
                await _mediator.Send(new UpdateCategoryBrandsByBrandIdCommand
                {
                    BrandId = brand.Id,
                    CategoryIds = request.CategoryIds ?? []
                }, cancellationToken);
                await _logger.LogAsync(ELogLevel.Information, $"Thương hiệu đã được cập nhật thành công với ID: {brand.Id}", "Cập nhật thương hiệu");


                // Xóa cache liên quan
                await _cacheInvalidationService.InvalidateBrandCache(brand.Id);

                return Result<bool>.Success(true);
            }
            catch (Exception ex)
            {
                await _logger.LogExceptionAsync(ex, "Đã xảy ra lỗi khi cập nhật thương hiệu");
                return Result<bool>.BadRequest($"Lỗi khi cập nhật thương hiệu: {ex.Message}");
            }

        }
    }
}


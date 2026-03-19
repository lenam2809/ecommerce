using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Products.Dto;
using Ecommerce.Domain.Interfaces;
using AutoMapper;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Application.Features.Products.Queries.GetProductById
{
    [Authorize(Policy = "ViewProducts")]
    public class GetProductByIdQueryHandler : IRequestHandler<GetProductByIdQuery, Result<ProductDto>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IFileStorageService _fileStorageService;
        private readonly IUserActivityService _userActivityService;


        public GetProductByIdQueryHandler(IUnitOfWork unitOfWork,
            IMapper mapper,
            IFileStorageService fileStorageService,
            IUserActivityService userActivityService)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _fileStorageService = fileStorageService;
            _userActivityService = userActivityService;


        }

        public async Task<Result<ProductDto>> Handle(GetProductByIdQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var product = await _unitOfWork.Products.GetByIdWithIncludeAsync(request.Id,
                query => query
                    .AsNoTracking()
                    .Include(entity => entity.Brand)
                    .Include(entity => entity.Category)
                    .Include(entity => entity.Variants)
                        .ThenInclude(variant => variant.Colors)
                    .Include(entity => entity.Variants)
                        .ThenInclude(variant => variant.Sizes)
                    .Include(entity => entity.Specifications)
                    .Include(entity => entity.Images)
                    .AsSplitQuery(),
                cancellationToken);

                if (product == null)
                {
                    return Result<ProductDto>.NotFound("Không tìm thấy sản phẩm.");
                }

                var productDto = _mapper.Map<ProductDto>(product);

                productDto.MainImage = await _fileStorageService.GetFileUrlAsync(productDto.MainImage);

                // Fix for CS1656: Use a for loop instead of foreach to modify the collection
                for (int i = 0; i < productDto.AdditionalImages.Count; i++)
                {
                    productDto.AdditionalImages[i] = await _fileStorageService.GetFileUrlAsync(productDto.AdditionalImages[i]);
                }

                await _userActivityService.LogActivityAsync("ViewProductBySlug", $"Xem sản phẩm {productDto.Name} có slug {productDto.Slug}", new { ProductId = productDto.Id });

                return Result<ProductDto>.Success(productDto);
            }
            catch (Exception ex)
            {
                return Result<ProductDto>.BadRequest(ex.Message);

            }

        }
    }
}


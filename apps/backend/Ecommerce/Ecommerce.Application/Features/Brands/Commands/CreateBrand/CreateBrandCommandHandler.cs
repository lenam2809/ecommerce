using Ecommerce.Application.Common.Constants;
using Ecommerce.Application.Common.Helpers;
using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.CategoryBrands.Commands.CreateCategoryBrand;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces;
using AutoMapper;
using MediatR;
using Microsoft.AspNetCore.Authorization;

namespace Ecommerce.Application.Features.Brands.Commands.CreateBrand
{
    [Authorize(Policy = EPermissions.CreateBrand)]
    public class CreateBrandCommandHandler : IRequestHandler<CreateBrandCommand, Result<Guid>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IFileStorageService _fileStorageService;
        private readonly IMediator _mediator;
        private readonly ICacheInvalidationService _cacheInvalidationService;


        public CreateBrandCommandHandler(IUnitOfWork unitOfWork, IMapper mapper,
            IFileStorageService fileStorageService,
            IMediator mediator,
            ICacheInvalidationService cacheInvalidationService)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _fileStorageService = fileStorageService;
            _mediator = mediator;
            _cacheInvalidationService = cacheInvalidationService;
        }

        public async Task<Result<Guid>> Handle(CreateBrandCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var brand = _mapper.Map<Brand>(request);

                brand.Slug = SlugHelper.GenerateSlug(brand.Name);
                if (request.Logo != null)
                {
                    string imagePath = await _fileStorageService.SaveFileAsync(
                        request.Logo,
                        "brands");

                    brand.LogoUrl = imagePath;
                }


                var addedBrand = await _unitOfWork.Brands.AddAsync(brand, cancellationToken);
                await _unitOfWork.CompleteAsync(cancellationToken);

                if (request.CategoryIds != null && request.CategoryIds.Count != 0)
                {
                    foreach (var categoryId in request.CategoryIds)
                    {
                        await _mediator.Send(new CreateCategoryBrandCommand
                        {
                            BrandId = addedBrand.Id,
                            CategoryId = categoryId
                        }, cancellationToken);
                    }
                }

                // Xóa cache liên quan
                await _cacheInvalidationService.InvalidateBrandCache(addedBrand.Id);

                return Result<Guid>.Success(addedBrand.Id);
            }
            catch (Exception ex)
            {
                return Result<Guid>.BadRequest(ex.Message);
            }

        }
    }
}


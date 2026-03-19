using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Products.Dto;
using Ecommerce.Domain.Interfaces;
using AutoMapper;
using MediatR;

namespace Ecommerce.Application.Features.Products.Queries.GetSimilarProducts
{
    public class GetSimilarProductsQueryHandler : IRequestHandler<GetSimilarProductsQuery, Result<List<ProductDto>>>
    {
        private readonly IProductRepository _productRepository;
        private readonly IMapper _mapper;
        private readonly IFileStorageService _fileStorageService;
        private readonly ICacheService _cacheService;

        public GetSimilarProductsQueryHandler(IProductRepository productRepository,
            IMapper mapper,
            IFileStorageService fileStorageService,
            ICacheService cacheService)
        {
            _productRepository = productRepository;
            _mapper = mapper;
            _fileStorageService = fileStorageService;
            _cacheService = cacheService;
        }

        public async Task<Result<List<ProductDto>>> Handle(GetSimilarProductsQuery request, CancellationToken cancellationToken)
        {
            try
            {
                // Tạo cache key
                string cacheKey = $"get_similar_products_{request.ProductId}";

                // Thử lấy từ cache
                var cachedResult = await _cacheService.GetAsync<List<ProductDto>>(cacheKey);
                if (cachedResult != null)
                {
                    return Result<List<ProductDto>>.Success(cachedResult);
                }

                var products = await _productRepository.GetSimilarProductsAsync(request.ProductId, cancellationToken);

                var productDtos = _mapper.Map<List<ProductDto>>(products);
                foreach (var productDto in productDtos)
                {
                    productDto.MainImage = await _fileStorageService.GetFileUrlAsync(productDto.MainImage);
                }

                // Lưu kết quả vào cache trong 10 phút
                await _cacheService.SetAsync(cacheKey, productDtos, TimeSpan.FromMinutes(10));

                return Result<List<ProductDto>>.Success(productDtos);
            }
            catch (Exception ex)
            {
                return Result<List<ProductDto>>.BadRequest(ex.Message);
            }
        }
    }
}


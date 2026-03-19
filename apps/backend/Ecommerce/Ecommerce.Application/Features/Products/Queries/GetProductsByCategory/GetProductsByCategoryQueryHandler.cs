using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Products.Dto;
using Ecommerce.Domain.Interfaces;
using AutoMapper;
using MediatR;

namespace Ecommerce.Application.Features.Products.Queries.GetProductsByCategory
{
    public class GetProductsByCategoryQueryHandler : IRequestHandler<GetProductsByCategoryQuery, Result<List<ProductDto>>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ICacheService _cacheService;


        public GetProductsByCategoryQueryHandler(IUnitOfWork unitOfWork,
            IMapper mapper,
            ICacheService cacheService)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _cacheService = cacheService;
        }

        public async Task<Result<List<ProductDto>>> Handle(GetProductsByCategoryQuery request, CancellationToken cancellationToken)
        {
            try
            {
                // Tạo cache key
                string cacheKey = $"get_products_by_category_id_{request.CategoryId}";

                // Thử lấy từ cache
                var cachedResult = await _cacheService.GetAsync<List<ProductDto>>(cacheKey);
                if (cachedResult != null)
                {
                    return Result<List<ProductDto>>.Success(cachedResult);
                }

                var products = await _unitOfWork.Products.GetByCategoryIdAsync(request.CategoryId, cancellationToken);

                // Cuối cùng mới ProjectTo sang ProductDto
                var result = _mapper.Map<List<ProductDto>>(products);

                // Lưu kết quả vào cache trong 10 phút
                await _cacheService.SetAsync(cacheKey, result, TimeSpan.FromMinutes(10));

                return Result<List<ProductDto>>.Success(result);
            }
            catch (Exception ex)
            {
                return Result<List<ProductDto>>.BadRequest(ex.Message);
            }

        }
    }
}


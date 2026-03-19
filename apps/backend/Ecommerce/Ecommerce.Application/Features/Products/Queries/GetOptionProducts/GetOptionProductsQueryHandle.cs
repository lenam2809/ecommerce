using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Brands.Queries.GetOptionProducts;
using Ecommerce.Domain.Interfaces;
using MediatR;

namespace Ecommerce.Application.Features.Products.Queries.GetOptionProducts
{
    public class GetOptionProductsQueryHandler : IRequestHandler<GetOptionProductsQuery, Result<List<Option>>>
    {
        private readonly IProductRepository _repository;
        private readonly ICacheService _cacheService;


        public GetOptionProductsQueryHandler(IProductRepository repository,
            ICacheService cacheService)
        {
            _repository = repository;
            _cacheService = cacheService;
        }

        public async Task<Result<List<Option>>> Handle(GetOptionProductsQuery request, CancellationToken cancellationToken)
        {
            try
            {
                // Tạo cache key
                string cacheKey = $"get_option_products";

                // Thử lấy từ cache
                var cachedResult = await _cacheService.GetAsync<List<Option>>(cacheKey);
                if (cachedResult != null)
                {
                    return Result<List<Option>>.Success(cachedResult);
                }

                var products = await _repository.GetAllAsync(cancellationToken);

                // Transform categories into options
                var options = products.Select(c => new Option
                {
                    Value = c.Id.ToString(),
                    Label = c.Name,
                    Disabled = false // You could add logic to disable certain categories if needed
                }).ToList();

                // Lưu kết quả vào cache trong 10 phút
                await _cacheService.SetAsync(cacheKey, options, TimeSpan.FromMinutes(10));

                return Result<List<Option>>.Success(options);
            }
            catch (Exception ex)
            {
                return Result<List<Option>>.BadRequest(ex.Message);

            }
        }
    }
}


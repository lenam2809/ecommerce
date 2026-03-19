using Ecommerce.Application.Common.Constants;
using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces;
using MediatR;

namespace Ecommerce.Application.Features.Brands.Queries.GetOptionBrands
{
    public class GetOptionBrandsQueryHandler : IRequestHandler<GetOptionBrandsQuery, Result<List<Option>>>
    {
        private readonly IBrandRepository _repository;
        private readonly ICacheService _cacheService;


        public GetOptionBrandsQueryHandler(IBrandRepository repository,
            ICacheService cacheService)
        {
            _repository = repository;
            _cacheService = cacheService;
        }

        public async Task<Result<List<Option>>> Handle(GetOptionBrandsQuery request, CancellationToken cancellationToken)
        {
            try
            {
                string cacheKey = CacheKeys.GetOptionBrands();

                // Thử lấy từ cache
                var cachedResult = await _cacheService.GetAsync<List<Option>>(cacheKey);
                if (cachedResult != null)
                {
                    return Result<List<Option>>.Success(cachedResult);
                }

                var brands = await _repository.GetAllAsync(cancellationToken);

                // Transform categories into options
                var options = brands.Select(c => new Option
                {
                    Value = c.Id.ToString(),
                    Label = c.Name,
                    Disabled = false // You could add logic to disable certain categories if needed
                }).ToList();

                // Lưu kết quả vào cache trong 10 phút
                await _cacheService.SetAsync(cacheKey, options, ECachePolicy.Long.ToTimeSpan());


                return Result<List<Option>>.Success(options);
            }
            catch (Exception ex)
            {
                return Result<List<Option>>.BadRequest(ex.Message);
            }


        }
    }
}


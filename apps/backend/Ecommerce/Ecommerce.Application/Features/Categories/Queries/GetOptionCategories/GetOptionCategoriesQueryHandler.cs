using Ecommerce.Application.Common.Constants;
using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Interfaces;
using MediatR;

namespace Ecommerce.Application.Features.Categories.Queries.GetOptionCategories
{
    public class GetOptionCategoriesQueryHandler : IRequestHandler<GetOptionCategoriesQuery, Result<List<object>>>
    {
        private readonly ICategoryRepository _repository;
        private readonly ICacheService _cacheService;


        public GetOptionCategoriesQueryHandler(ICategoryRepository repository,
            ICacheService cacheService)
        {
            _repository = repository;
            _cacheService = cacheService;
        }

        public async Task<Result<List<object>>> Handle(GetOptionCategoriesQuery request, CancellationToken cancellationToken)
        {
            try
            {
                // Tạo cache key
                string cacheKey = CacheKeys.GetOptionCategories(request);

                // Thử lấy từ cache
                var cachedResult = await _cacheService.GetAsync<List<object>>(cacheKey);
                if (cachedResult != null)
                {
                    return Result<List<object>>.Success(cachedResult);
                }


                // Get all categories
                var allCategories = await _repository.GetAllAsync(cancellationToken);

                if (!request.IncludeChildren)
                {
                    // Simple flat list - return all categories as options
                    var options = allCategories.Select(c => new Option
                    {
                        Value = c.Id.ToString(),
                        Label = c.Name,
                        Disabled = false
                    }).ToList();

                    return Result<List<object>>.Success([.. options.Cast<object>()]);
                }

                // Get parent categories for grouping
                var parentCategories = allCategories.Where(c => c.ParentId == null).ToList();

                // Create option groups
                var optionGroups = new List<OptionGroup>();

                foreach (var parent in parentCategories)
                {
                    var group = new OptionGroup
                    {
                        Label = parent.Name,
                        Options = []
                    };

                    // Add parent as an option
                    group.Options.Add(new Option
                    {
                        Value = parent.Id.ToString(),
                        Label = parent.Name,
                        Disabled = false
                    });

                    // Add children as options
                    var children = allCategories.Where(c => c.ParentId == parent.Id).ToList();
                    foreach (var child in children)
                    {
                        group.Options.Add(new Option
                        {
                            Value = child.Id.ToString(),
                            Label = $"→ {child.Name}",
                            Disabled = false
                        });
                    }

                    optionGroups.Add(group);
                }

                var result = optionGroups.Cast<object>().ToList();

                // Lưu kết quả vào cache trong 10 phút
                await _cacheService.SetAsync(cacheKey, result, TimeSpan.FromMinutes(10));

                return Result<List<object>>.Success(result);
            }
            catch (Exception ex)
            {
                return Result<List<object>>.BadRequest(ex.Message);
            }
        }
    }
}


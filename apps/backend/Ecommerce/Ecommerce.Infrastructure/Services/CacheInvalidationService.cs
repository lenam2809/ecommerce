using Ecommerce.Application.Common.Constants;
using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Logging;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces.Logging;

namespace Ecommerce.Infrastructure.Services
{
    public class CacheInvalidationService : ICacheInvalidationService
    {
        private readonly ICacheService _cacheService;
        private readonly IEnhancedLogger _logger;

        public CacheInvalidationService(ICacheService cacheService, IEnhancedLogger logger)
        {
            _cacheService = cacheService;
            _logger = logger;
        }

        public async Task InvalidateUserCache(Guid userId)
        {
            try
            {
                // Xóa cache người dùng cụ thể
                await _cacheService.RemoveAsync(CacheKeys.GetUserById(userId));
                await _cacheService.RemoveAsync(CacheKeys.GetUserRoles(userId));
                await _cacheService.RemoveAsync(CacheKeys.GetUserPermissions(userId));

                // Xóa cache tất cả người dùng để đảm bảo danh sách được cập nhật
                await InvalidateAllUsersCache();

                await _logger.LogAsync(ELogLevel.Debug, $"Đã xóa cache cho người dùng {userId}", "InvalidateUserCache");
            }
            catch (Exception ex)
            {
                await _logger.LogAsync(ELogLevel.Error, $"Lỗi khi xóa cache người dùng: {ex.Message}", "InvalidateUserCache");
            }
        }

        public async Task InvalidateRoleCache(string role)
        {
            try
            {
                await _cacheService.RemoveAsync(CacheKeys.GetRolePermissions(role));
                await InvalidateAllUsersCache(); // Vì thay đổi vai trò có thể ảnh hưởng đến kết quả GetUsers
                await _logger.LogAsync(ELogLevel.Debug, $"Đã xóa cache cho vai trò {role}", "InvalidateRoleCache");
            }
            catch (Exception ex)
            {
                await _logger.LogAsync(ELogLevel.Error, $"Lỗi khi xóa cache vai trò: {ex.Message}", "InvalidateRoleCache");
            }
        }

        public async Task InvalidateAllUsersCache()
        {
            try
            {
                // Tìm và xóa tất cả các key bắt đầu bằng "users_"
                // Lưu ý: Đây là triển khai đơn giản, trong thực tế bạn cần tùy biến
                // theo cơ chế Redis hoặc cache provider đang sử dụng
                await _cacheService.RemoveAsync(CacheKeys.GetAllUsers());
                await _logger.LogAsync(ELogLevel.Debug, "Đã xóa cache tất cả người dùng", "InvalidateAllUsersCache");
            }
            catch (Exception ex)
            {
                await _logger.LogAsync(ELogLevel.Error, $"Lỗi khi xóa cache tất cả người dùng: {ex.Message}", "InvalidateAllUsersCache");
            }
        }

        public async Task InvalidateTenantCache(Guid tenantId)
        {
            try
            {
                await _cacheService.RemoveAsync(CacheKeys.GetTenant(tenantId));
                await InvalidateAllTenantsCache();
                await _logger.LogAsync(ELogLevel.Debug, $"Đã xóa cache cho tenant {tenantId}", "InvalidateTenantCache");
            }
            catch (Exception ex)
            {
                await _logger.LogAsync(ELogLevel.Error, $"Lỗi khi xóa cache tenant: {ex.Message}", "InvalidateTenantCache");
            }
        }

        public async Task InvalidateAllTenantsCache()
        {

            try
            {
                await _cacheService.RemoveAsync(CacheKeys.GetAllTenants());
                await _logger.LogAsync(ELogLevel.Debug, "Đã xóa cache tất cả tenant", "InvalidateAllTenantsCache");
            }
            catch (Exception ex)
            {
                await _logger.LogExceptionAsync(ex, $"Lỗi khi xóa cache tất cả tenant: {ex.Message}");
            }
        }

        public async Task InvalidateProductCache(Guid productId)
        {
            try
            {
                // Xóa cache danh sách sản phẩm
                await _cacheService.RemoveByPrefixAsync(CacheKeys.ProductAll);
                
                // Xóa cache chi tiết sản phẩm (Tạm thời xóa hết detail để đảm bảo tính đúng đắn do key phức tạp)
                // Cải tiến sau: Chỉ xóa key chứa ID
                await _cacheService.RemoveByPrefixAsync(CacheKeys.ProductDetail);

                // Xóa cache legacy (những chỗ chưa refactor)
                await _cacheService.RemoveAsync(CacheKeys.GetProducts());
                await _cacheService.RemoveAsync(CacheKeys.GetOptionProducts());
                // Không cần xóa key detail cũ vì logic mới đã phủ

                await _logger.LogAsync(ELogLevel.Debug, $"Đã xóa cache sản phẩm {productId}", "InvalidateProductCache");
            }
            catch (Exception ex)
            {
                await _logger.LogExceptionAsync(ex, $"Lỗi khi xóa cache sản phẩm {productId}: {ex.Message}");
            }
        }

        public async Task InvalidateCategoryCache(Guid categoryId)
        {
            try
            {
                await _cacheService.RemoveByPrefixAsync(CacheKeys.CategoryAll);
                await _cacheService.RemoveByPrefixAsync(CacheKeys.CategoryDetail);

                // Legacy
                await _cacheService.RemoveAsync(CacheKeys.GetAllCategories());
                await _cacheService.RemoveAsync(CacheKeys.GetOptionCategories(new Application.Features.Categories.Queries.GetOptionCategories.GetOptionCategoriesQuery())); // Hơi khó tạo object, bỏ qua hoặc xóa cứng chuỗi nếu biết
                // Để đơn giản, ta xóa prefix legacy nếu có thể, hoặc chấp nhận miss legacy option cache (sẽ expire sau 10p)
                // Hoặc dùng RemoveByPrefix cho legacy constants nếu chúng có prefix chung
                // Legacy keys của Category khá lộn xộn: "get_categories_all", "get_option_categories_..."
                
                // Xóa "get_categories_all"
                await _cacheService.RemoveAsync("get_categories_all");
                // Xóa option categories (Prefix: get_option_categories_)
                await _cacheService.RemoveByPrefixAsync("get_option_categories_");

                await _logger.LogAsync(ELogLevel.Debug, $"Đã xóa cache danh mục {categoryId}", "InvalidateCategoryCache");
            }
            catch (Exception ex)
            {
                await _logger.LogExceptionAsync(ex, $"Lỗi xóa cache danh mục {categoryId}");
            }
        }

        public async Task InvalidateBrandCache(Guid brandId)
        {
            try
            {
                await _cacheService.RemoveByPrefixAsync(CacheKeys.BrandAll);
                await _cacheService.RemoveByPrefixAsync(CacheKeys.BrandDetail);

                // Legacy
                await _cacheService.RemoveAsync(CacheKeys.GetAllBrands()); // get_brands_all
                await _cacheService.RemoveByPrefixAsync("get_brand_by_id_");
                await _cacheService.RemoveByPrefixAsync("get_option_brands");

                await _logger.LogAsync(ELogLevel.Debug, $"Đã xóa cache thương hiệu {brandId}", "InvalidateBrandCache");
            }
            catch (Exception ex)
            {
                 await _logger.LogExceptionAsync(ex, $"Lỗi xóa cache thương hiệu {brandId}");
            }
        }

        public async Task InvalidateBannerCache(Guid bannerId)
        {
            try
            {
                await _cacheService.RemoveByPrefixAsync(CacheKeys.BannerAll);
                await _cacheService.RemoveByPrefixAsync(CacheKeys.BannerDetail);
                
                // Legacy
                await _cacheService.RemoveAsync(CacheKeys.GetBanners());
                await _cacheService.RemoveAsync(CacheKeys.GetBannerById(new Application.Features.Banners.Queries.GetBannerById.GetBannerByIdQuery { Id = bannerId }));

                await _logger.LogAsync(ELogLevel.Debug, $"Đã xóa cache banner {bannerId}", "InvalidateBannerCache");
            }
            catch (Exception ex)
            {
                await _logger.LogExceptionAsync(ex, $"Lỗi xóa cache banner {bannerId}");
            }
        }

        public async Task InvalidateAboutCache(Guid aboutId)
        {
             try
            {
                await _cacheService.RemoveByPrefixAsync(CacheKeys.AboutAll);
                await _cacheService.RemoveByPrefixAsync(CacheKeys.AboutDetail);
                await _cacheService.RemoveByPrefixAsync(CacheKeys.AboutActive);
                
                // Legacy
                await _cacheService.RemoveAsync(CacheKeys.GetAbouts());
                await _cacheService.RemoveAsync(CacheKeys.GetActiveAbout());
                await _cacheService.RemoveAsync(CacheKeys.GetAboutById(new Application.Features.About.Queries.GetAboutById.GetAboutByIdQuery { Id = aboutId }));

                await _logger.LogAsync(ELogLevel.Debug, $"Đã xóa cache about {aboutId}", "InvalidateAboutCache");
            }
            catch (Exception ex)
            {
                await _logger.LogExceptionAsync(ex, $"Lỗi xóa cache about {aboutId}");
            }
        }

        public async Task InvalidateContactCache(Guid contactId)
        {
             try
            {
                await _cacheService.RemoveByPrefixAsync(CacheKeys.ContactAll);
                await _cacheService.RemoveByPrefixAsync(CacheKeys.ContactDetail);
                await _cacheService.RemoveByPrefixAsync(CacheKeys.ContactActive);
                
                // Legacy
                await _cacheService.RemoveAsync(CacheKeys.GetContacts());
                await _cacheService.RemoveAsync(CacheKeys.GetActiveContact());
                await _cacheService.RemoveAsync(CacheKeys.GetContactById(new Application.Features.Contact.Queries.GetContactById.GetContactByIdQuery { Id = contactId }));

                await _logger.LogAsync(ELogLevel.Debug, $"Đã xóa cache contact {contactId}", "InvalidateContactCache");
            }
            catch (Exception ex)
            {
                await _logger.LogExceptionAsync(ex, $"Lỗi xóa cache contact {contactId}");
            }
        }
    }
}


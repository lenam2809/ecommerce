using Ecommerce.Application.Features.About.Queries.GetAboutById;
using Ecommerce.Application.Features.AuditLogs.Queries.GetLogEntryById;
using Ecommerce.Application.Features.Banners.Queries.GetBannerById;
using Ecommerce.Application.Features.Brands.Queries.GetBrandById;
using Ecommerce.Application.Features.Brands.Queries.GetBrandBySlug;
using Ecommerce.Application.Features.Brands.Queries.GetBrandsByCategoryId;
using Ecommerce.Application.Features.Brands.Queries.GetCategories;
using Ecommerce.Application.Features.Categories.Queries.GetCategoriesByBrandId;
using Ecommerce.Application.Features.Categories.Queries.GetCategoryById;
using Ecommerce.Application.Features.Categories.Queries.GetCategoryBySlug;
using Ecommerce.Application.Features.Categories.Queries.GetOptionCategories;
using Ecommerce.Application.Features.Categories.Queries.GetTopPopularCategories;
using Ecommerce.Application.Features.Contact.Queries.GetContactById;
using Ecommerce.Application.Features.Permissions.Queries.GetPermissionById;
using Ecommerce.Application.Features.Permissions.Queries.GetPermissionsByRoleId;
using Ecommerce.Application.Features.Permissions.Queries.GetPermissionsByUserId;
using Ecommerce.Application.Features.Products.Queries.GetProductById;
using Ecommerce.Application.Features.Products.Queries.GetProductBySlug;
using Ecommerce.Application.Features.Products.Queries.GetProductReviews;
using Ecommerce.Application.Features.Products.Queries.GetProductsByBrand;
using Ecommerce.Application.Features.Products.Queries.GetProductsByCategory;
using Ecommerce.Application.Features.Products.Queries.GetSimilarProducts;
using Ecommerce.Application.Features.PromoCodes.Queries.GetPromoCodeById;
using Ecommerce.Domain.Enums;

namespace Ecommerce.Application.Common.Constants
{
    public static class CacheKeys
    {
        // Standard Prefixes for Automatic Caching
        public const string ProductAll = "Products_All";
        public const string ProductDetail = "Product_Detail";

        // Category
        public const string CategoryAll = "Categories_All";
        public const string CategoryDetail = "Category_Detail";

        // Brand
        public const string BrandAll = "Brands_All";
        public const string BrandDetail = "Brand_Detail";

        // Banner
        public const string BannerAll = "Banners_All";
        public const string BannerDetail = "Banner_Detail";

        // About
        public const string AboutAll = "Abouts_All";
        public const string AboutDetail = "About_Detail";
        public const string AboutActive = "About_Active";

        // Contact
        public const string ContactAll = "Contacts_All";
        public const string ContactDetail = "Contact_Detail";
        public const string ContactActive = "Contact_Active";
        
        // ... (Old code below)
        #region User related cache keys
        public static string GetAllUsers(string? roleFilter = null) => $"users_all_{roleFilter ?? "all"}";
        public static string GetUserById(Guid userId) => $"user_{userId}";
        public static string GetUserRoles(Guid userId) => $"user_roles_{userId}";
        #endregion

        #region Auth related cache keys
        public static string GetUserPermissions(Guid userId) => $"user_permissions_{userId}";
        public static string GetRolePermissions(string role) => $"role_permissions_{role}";
        #endregion

        #region Configuration cache keys
        public static string GetAppSettings() => "app_settings";
        #endregion

        #region Other entity related cache keys
        public static string GetTenant(Guid tenantId) => $"tenant_{tenantId}";
        public static string GetAllTenants() => "tenants_all";
        #endregion

        #region user
        public static string GetUsersForUser(Guid userId, string? roleFilter = null) =>
            $"users_{userId}_{roleFilter ?? "all"}";
        #endregion

        #region brand
        public static string GetAllBrands() => "get_brands_all";
        public static string GetBrandById(GetBrandByIdQuery request) => $"get_brand_by_id_{request.Id}";
        public static string GetBrandBySlug(GetBrandBySlugQuery request) => $"get_brand_by_slug_{request.Slug}";
        public static string GetOptionBrands() => "get_option_brands";
        public static string GetBrands(GetBrandsQuery request, bool isPattern = false)
        {
            if (isPattern)
            {
                return "get_paged_brands_*";
            }

            string filterRaw = $"{request.SearchTerm?.Trim().ToLowerInvariant()}" +
                    $"_{request.SortBy?.Trim().ToLowerInvariant()}" +
                    $"_{request.IsDescending}";

            string filterHash = Convert.ToBase64String(System.Security.Cryptography.MD5.Create()
                .ComputeHash(System.Text.Encoding.UTF8.GetBytes(filterRaw)));


            return $"get_paged_banners_{request.PageNumber}_{request.PageSize}_{filterHash}";
        }

        public static string GetBrandsByCategoryId(GetBrandsByCategoryIdQuery request)
            => $"get_brands_by_category_id_{request.CategoryId}";

        #endregion

        #region about
        public static string GetAboutById(GetAboutByIdQuery request) => $"get_about_by_id_{request.Id}";
        public static string GetAbouts() => "get_abouts_all";
        public static string GetActiveAbout() => "get_active_about";
        #endregion

        #region banner
        public static string GetBannerById(GetBannerByIdQuery request) => $"get_banner_by_id_{request.Id}";
        public static string GetBanners() => "get_banners_all";
        #endregion

        #region category
        public static string GetAllCategories() => "get_categories_all";
        public static string GetCategoriesByBrandId(GetCategoriesByBrandIdQuery request) => $"get_categories_by_brand_id_{request.BrandId}";
        public static string GetCategoryById(GetCategoryByIdQuery request) => $"get_category_by_id_{request.Id}";
        public static string GetCategoryBySlug(GetCategoryBySlugQuery request) => $"get_category_by_slug_{request.Slug}_{request.IncludeChildren}_{request.IncludeBrands}";
        public static string GetOptionCategories(GetOptionCategoriesQuery request) => $"get_option_categories_{request.IncludeChildren}";
        public static string GetTopPopularCategories(GetTopPopularCategoriesQuery request) => $"get_top_popular_categories_{request.Limit}";
        #endregion

        #region contact
        public static string GetContactById(GetContactByIdQuery request) => $"get_contact_by_id_{request.Id}";
        public static string GetContacts() => "get_contacts_all";
        public static string GetActiveContact() => "get_active_contact";
        #endregion

        #region logEntry
        public static string GetLogEntryById(GetLogEntryByIdQuery request, string userContext) => $"get_log_entry_by_id_{request.Id}_{userContext}";
        #endregion

        #region permission
        public static string GetAllPermissions() => "get_permissions_all";
        public static string GetOptionPermissions() => "get_option_permissions";
        public static string GetPermissionById(GetPermissionByIdQuery request) => $"get_permission_by_id_{request.Id}";
        public static string GetPermissionsByRoleId(GetPermissionsByRoleIdQuery request) => $"get_permissions_by_role_id_{request.RoleId}";
        public static string GetPermissionsByUserId(GetPermissionsByUserIdQuery request) => $"get_permissions_by_user_id_{request.UserId}";
        #endregion

        #region product
        public static string GetBestsellingProducts() => "get_bestselling_products";
        public static string GetOptionProducts() => "get_option_products";
        public static string GetProductById(GetProductByIdQuery request) => $"get_product_by_id_{request.Id}";
        public static string GetProductBySlug(GetProductBySlugQuery request) => $"get_product_by_slug_{request.Slug}";
        public static string GetProductReviews(GetProductReviewsQuery request) => $"get_product_reviews_{request.ProductId}";
        public static string GetProducts() => "get_products_all";
        public static string GetProductsByBrand(GetProductsByBrandQuery request) => $"get_products_by_brand_{request.BrandId}";
        public static string GetProductsByCategory(GetProductsByCategoryQuery request) => $"get_products_by_category_{request.CategoryId}";
        public static string GetSimilarProducts(GetSimilarProductsQuery request) => $"get_similar_products_{request.ProductId}";
        #endregion

        #region promoCode
        public static string GetActivePromoCodes() => "get_active_promo_codes";
        public static string GetPromoCodeById(GetPromoCodeByIdQuery request) => $"get_promo_code_by_id_{request.Id}";
        #endregion

    }

    /// <summary>
    /// Helper để chuyển đổi từ CachePolicy sang TimeSpan.
    /// </summary>
    public static class CachePolicyHelper
    {
        /// <summary>
        /// Chuyển đổi chính sách cache thành giá trị TimeSpan tương ứng.
        /// </summary>
        /// <param name="policy">Chính sách cache</param>
        /// <returns>Thời gian sống của cache tương ứng</returns>
        public static TimeSpan ToTimeSpan(this ECachePolicy policy)
        {
            return policy switch
            {
                ECachePolicy.Short => TimeSpan.FromMinutes(10),
                ECachePolicy.Medium => TimeSpan.FromHours(1),
                ECachePolicy.Long => TimeSpan.FromDays(1),
                ECachePolicy.Never => TimeSpan.FromDays(365), // hoặc TimeSpan.MaxValue nếu phù hợp hơn
                _ => TimeSpan.FromMinutes(10)
            };
        }
    }

    public static class CachePrefixes
    {
        // Product-related
        public const string GetProductById = "get_product_by_id_";
        public const string GetProductBySlug = "get_product_by_slug_";

        // Category-related
        public const string GetAllCategories = "get_categories_all";
        public const string GetCategoriesByBrandId = "get_categories_by_brand_id_";

        // Brand-related
        public const string GetBrandById = "get_brand_by_id_";
        public const string GetBrandBySlug = "get_brand_by_slug_";

        // Banner-related
        public const string GetBannerById = "get_banner_by_id_";

        // Permission-related
        public const string GetPermissionById = "get_permission_by_id_";

        // PromoCode-related
        public const string GetPromoCodeById = "get_promo_code_by_id_";

        // Log-related
        public const string GetLogEntryById = "get_log_entry_by_id_";

        // User-related
        public const string GetUserById = "user_";
        public const string GetUserRoles = "user_roles_";
        public const string GetUsersForUser = "users_";

        // Role-related
        public const string GetRolePermissions = "role_permissions_";

        // Global config
        public const string AppSettings = "app_settings";

        // Tenant
        public const string GetTenant = "tenant_";
        public const string GetAllTenants = "tenants_all";

        // Option cache
        public const string GetOptionCategories = "get_option_categories_";
        public const string GetOptionBrands = "get_option_brands";
        public const string GetOptionProducts = "get_option_products";
        public const string GetOptionPermissions = "get_option_permissions";
    }
}


namespace Ecommerce.Domain.Enums
{
    /// <summary>
    /// Constants chứa các quyền trong hệ thống
    /// </summary>
    public static class EPermissions
    {
        // User permissions
        public const string ViewUsers = "ViewUsers";
        public const string CreateUser = "CreateUser";
        public const string EditUser = "EditUser";
        public const string DeleteUser = "DeleteUser";

        // Role permissions
        public const string ViewRoles = "ViewRoles";
        public const string CreateRole = "CreateRole";
        public const string EditRole = "EditRole";
        public const string DeleteRole = "DeleteRole";

        // Permission management
        public const string ViewPermissions = "ViewPermissions";
        public const string CreatePermission = "CreatePermission";
        public const string EditPermission = "EditPermission";
        public const string DeletePermission = "DeletePermission";
        public const string AssignPermission = "AssignPermission";

        // Product permissions
        public const string ViewProducts = "ViewProducts";
        public const string CreateProduct = "CreateProduct";
        public const string EditProduct = "EditProduct";
        public const string DeleteProduct = "DeleteProduct";

        // Category permissions
        public const string ViewCategories = "ViewCategories";
        public const string CreateCategory = "CreateCategory";
        public const string EditCategory = "EditCategory";
        public const string DeleteCategory = "DeleteCategory";

        // Brand permissions
        public const string ViewBrands = "ViewBrands";
        public const string CreateBrand = "CreateBrand";
        public const string EditBrand = "EditBrand";
        public const string DeleteBrand = "DeleteBrand";

        // Order permissions
        public const string ViewOrders = "ViewOrders";
        public const string CreateOrder = "CreateOrder";
        public const string EditOrder = "EditOrder";
        public const string DeleteOrder = "DeleteOrder";


        // Các quyền khác: quản lý báo cáo, quản lý khuyến mãi, quản lý banner, 
        public const string ViewReports = "ViewReports";

        public const string ViewPromotions = "ViewPromotions";
        public const string CreatePromotion = "CreatePromotion";
        public const string EditPromotion = "EditPromotion";
        public const string DeletePromotion = "DeletePromotion";

        public const string ViewBanners = "ViewBanners";
        public const string CreateBanner = "CreateBanner";
        public const string EditBanner = "EditBanner";
        public const string DeleteBanner = "DeleteBanner";

        public const string ViewSettings = "ViewSettings";
        public const string EditSettings = "EditSettings";

        public const string ViewLogs = "ViewLogs";
        public const string DeleteLogs = "DeleteLogs";

        public const string ViewFeedbacks = "ViewFeedbacks";
        public const string RespondFeedbacks = "RespondFeedbacks";

        public const string ViewNotifications = "ViewNotifications";
        public const string CreateNotification = "CreateNotification";
        public const string EditNotification = "EditNotification";
        public const string DeleteNotification = "DeleteNotification";


        // Các nhóm quyền
        public static class Groups
        {
            public static readonly string[] UserManagement = [
                ViewUsers, CreateUser, EditUser, DeleteUser
            ];

            public static readonly string[] RoleManagement = [
                ViewRoles, CreateRole, EditRole, DeleteRole
            ];

            public static readonly string[] PermissionManagement = [
                ViewPermissions, CreatePermission, EditPermission, DeletePermission, AssignPermission
            ];

            public static readonly string[] ProductManagement = [
                ViewProducts, CreateProduct, EditProduct, DeleteProduct
            ];

            public static readonly string[] CategoryManagement = {
                ViewCategories, CreateCategory, EditCategory, DeleteCategory
            };

            public static readonly string[] OrderManagement = {
                ViewOrders, CreateOrder, EditOrder, DeleteOrder
            };


            public static readonly string[] ReportManagement = {
                ViewReports
            };

            public static readonly string[] PromotionManagement = {
                ViewPromotions, CreatePromotion, EditPromotion, DeletePromotion
            };

            public static readonly string[] BannerManagement = {
                ViewBanners, CreateBanner, EditBanner, DeleteBanner
            };

            public static readonly string[] SettingsManagement = {
                ViewSettings, EditSettings
            };

            public static readonly string[] LogManagement = {
                ViewLogs, DeleteLogs
            };

            public static readonly string[] FeedbackManagement = {
                ViewFeedbacks, RespondFeedbacks
            };

            public static readonly string[] NotificationManagement = {
                ViewNotifications, CreateNotification, EditNotification, DeleteNotification
            };

            // Quyền của Admin
            public static readonly string[] AdminPermissions =
                [.. UserManagement,
                .. RoleManagement,
                .. PermissionManagement,
                .. ProductManagement,
                .. CategoryManagement,
                .. OrderManagement,
                .. ReportManagement,
                .. PromotionManagement,
                .. BannerManagement,
                .. SettingsManagement,
                .. LogManagement,
                .. FeedbackManagement,
                .. NotificationManagement
                ];

            // Quyền của Staff
            public static readonly string[] StaffPermissions =
                [.. ProductManagement,
                .. CategoryManagement,
                .. OrderManagement,
                .. new[] { ViewUsers, EditUser }];

            // Quyền của Customer
            public static readonly string[] CustomerPermissions = [
                ViewProducts, ViewCategories, CreateOrder, ViewOrders
            ];
        }
    }
}


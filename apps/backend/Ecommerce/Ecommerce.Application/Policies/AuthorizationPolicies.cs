using Ecommerce.Domain.Enums;
using Microsoft.AspNetCore.Authorization;

namespace Ecommerce.Application.Policies
{
    public static class AuthorizationPolicies
    {
        public static void ConfigurePolicies(AuthorizationOptions options)
        {
            // AdminOnly policy remains unchanged
            options.AddPolicy("AdminOnly", policy =>
                policy.RequireRole("Admin"));

            // User management
            options.AddPolicy(EPermissions.ViewUsers, policy =>
                policy.RequireClaim("Permission", EPermissions.ViewUsers));
            options.AddPolicy(EPermissions.CreateUser, policy =>
                policy.RequireClaim("Permission", EPermissions.CreateUser));
            options.AddPolicy(EPermissions.EditUser, policy =>
                policy.RequireClaim("Permission", EPermissions.EditUser));
            options.AddPolicy(EPermissions.DeleteUser, policy =>
                policy.RequireClaim("Permission", EPermissions.DeleteUser));

            // Product management
            options.AddPolicy(EPermissions.ViewProducts, policy =>
                policy.RequireClaim("Permission", EPermissions.ViewProducts));
            options.AddPolicy(EPermissions.CreateProduct, policy =>
                policy.RequireClaim("Permission", EPermissions.CreateProduct));
            options.AddPolicy(EPermissions.EditProduct, policy =>
                policy.RequireClaim("Permission", EPermissions.EditProduct));
            options.AddPolicy(EPermissions.DeleteProduct, policy =>
                policy.RequireClaim("Permission", EPermissions.DeleteProduct));

            // Category management
            options.AddPolicy(EPermissions.ViewCategories, policy =>
                policy.RequireClaim("Permission", EPermissions.ViewCategories));
            options.AddPolicy(EPermissions.CreateCategory, policy =>
                policy.RequireClaim("Permission", EPermissions.CreateCategory));
            options.AddPolicy(EPermissions.EditCategory, policy =>
                policy.RequireClaim("Permission", EPermissions.EditCategory));
            options.AddPolicy(EPermissions.DeleteCategory, policy =>
                policy.RequireClaim("Permission", EPermissions.DeleteCategory));

            // Brand management
            options.AddPolicy(EPermissions.ViewBrands, policy =>
                policy.RequireClaim("Permission", EPermissions.ViewBrands));
            options.AddPolicy(EPermissions.CreateBrand, policy =>
                policy.RequireClaim("Permission", EPermissions.CreateBrand));
            options.AddPolicy(EPermissions.EditBrand, policy =>
                policy.RequireClaim("Permission", EPermissions.EditBrand));
            options.AddPolicy(EPermissions.DeleteBrand, policy =>
                policy.RequireClaim("Permission", EPermissions.DeleteBrand));

            // Order management
            options.AddPolicy(EPermissions.ViewOrders, policy =>
                policy.RequireClaim("Permission", EPermissions.ViewOrders));
            options.AddPolicy(EPermissions.CreateOrder, policy =>
                policy.RequireClaim("Permission", EPermissions.CreateOrder));
            options.AddPolicy(EPermissions.EditOrder, policy =>
                policy.RequireClaim("Permission", EPermissions.EditOrder));
            options.AddPolicy(EPermissions.DeleteOrder, policy =>
                policy.RequireClaim("Permission", EPermissions.DeleteOrder));

            // Role-specific policy
            options.AddPolicy("Staff:CreateProduct", policy =>
                policy.RequireAssertion(context =>
                    context.User.IsInRole("Staff") &&
                    context.User.HasClaim(c => c.Type == "Permission" && c.Value == EPermissions.CreateProduct)));

            // Permission management
            options.AddPolicy(EPermissions.ViewPermissions, policy =>
                policy.RequireClaim("Permission", EPermissions.ViewPermissions));
            options.AddPolicy(EPermissions.CreatePermission, policy =>
                policy.RequireClaim("Permission", EPermissions.CreatePermission));
            options.AddPolicy(EPermissions.EditPermission, policy =>
                policy.RequireClaim("Permission", EPermissions.EditPermission));
            options.AddPolicy(EPermissions.DeletePermission, policy =>
                policy.RequireClaim("Permission", EPermissions.DeletePermission));
            options.AddPolicy(EPermissions.AssignPermission, policy =>
                policy.RequireClaim("Permission", EPermissions.AssignPermission));

            // Admin role management
            options.AddPolicy("Admin:ManageRoles", policy =>
                policy.RequireRole("Admin"));

            // Additional policies from EPermissions
            options.AddPolicy(EPermissions.ViewRoles, policy =>
                policy.RequireClaim("Permission", EPermissions.ViewRoles));
            options.AddPolicy(EPermissions.CreateRole, policy =>
                policy.RequireClaim("Permission", EPermissions.CreateRole));
            options.AddPolicy(EPermissions.EditRole, policy =>
                policy.RequireClaim("Permission", EPermissions.EditRole));
            options.AddPolicy(EPermissions.DeleteRole, policy =>
                policy.RequireClaim("Permission", EPermissions.DeleteRole));

            // Other policies from EPermissions
            options.AddPolicy(EPermissions.ViewReports, policy =>
                policy.RequireClaim("Permission", EPermissions.ViewReports));

            options.AddPolicy(EPermissions.ViewPromotions, policy =>
                policy.RequireClaim("Permission", EPermissions.ViewPromotions));
            options.AddPolicy(EPermissions.CreatePromotion, policy =>
                policy.RequireClaim("Permission", EPermissions.CreatePromotion));
            options.AddPolicy(EPermissions.EditPromotion, policy =>
                policy.RequireClaim("Permission", EPermissions.EditPromotion));
            options.AddPolicy(EPermissions.DeletePromotion, policy =>
                policy.RequireClaim("Permission", EPermissions.DeletePromotion));

            options.AddPolicy(EPermissions.ViewBanners, policy =>
                policy.RequireClaim("Permission", EPermissions.ViewBanners));
            options.AddPolicy(EPermissions.CreateBanner, policy =>
                policy.RequireClaim("Permission", EPermissions.CreateBanner));
            options.AddPolicy(EPermissions.EditBanner, policy =>
                policy.RequireClaim("Permission", EPermissions.EditBanner));
            options.AddPolicy(EPermissions.DeleteBanner, policy =>
                policy.RequireClaim("Permission", EPermissions.DeleteBanner));

            options.AddPolicy(EPermissions.ViewSettings, policy =>
                policy.RequireClaim("Permission", EPermissions.ViewSettings));
            options.AddPolicy(EPermissions.EditSettings, policy =>
                policy.RequireClaim("Permission", EPermissions.EditSettings));

            options.AddPolicy(EPermissions.ViewLogs, policy =>
                policy.RequireClaim("Permission", EPermissions.ViewLogs));
            options.AddPolicy(EPermissions.DeleteLogs, policy =>
                policy.RequireClaim("Permission", EPermissions.DeleteLogs));

            options.AddPolicy(EPermissions.ViewFeedbacks, policy =>
                policy.RequireClaim("Permission", EPermissions.ViewFeedbacks));
            options.AddPolicy(EPermissions.RespondFeedbacks, policy =>
                policy.RequireClaim("Permission", EPermissions.RespondFeedbacks));

            options.AddPolicy(EPermissions.ViewNotifications, policy =>
                policy.RequireClaim("Permission", EPermissions.ViewNotifications));
            options.AddPolicy(EPermissions.CreateNotification, policy =>
                policy.RequireClaim("Permission", EPermissions.CreateNotification));
            options.AddPolicy(EPermissions.EditNotification, policy =>
                policy.RequireClaim("Permission", EPermissions.EditNotification));
            options.AddPolicy(EPermissions.DeleteNotification, policy =>
                policy.RequireClaim("Permission", EPermissions.DeleteNotification));
        }
    }
}

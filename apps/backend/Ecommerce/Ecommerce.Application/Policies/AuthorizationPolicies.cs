using Ecommerce.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using System.Reflection;

namespace Ecommerce.Application.Policies
{
    public static class AuthorizationClaimTypes
    {
        public const string Permission = "Permission";
    }

    public static class AuthorizationPolicyNames
    {
        public const string AdminOnly = "AdminOnly";
        public const string AdminManageRoles = "Admin:ManageRoles";
        public const string ProductDelete = "Products.Delete";

        public static class Staff
        {
            public const string CreateProduct = "Staff:CreateProduct";
            public const string EditProduct = "Staff:EditProduct";
            public const string CreatePromoCode = "Staff:CreatePromoCode";
            public const string EditPromoCode = "Staff:EditPromoCode";
            public const string DeletePromoCode = "Staff:DeletePromoCode";
        }

        public static string RolePermission(string role, string permission) => $"{role}:{permission}";
    }

    public static class AuthorizationPolicies
    {
        public static void ConfigurePolicies(AuthorizationOptions options)
        {
            // AdminOnly policy
            options.AddPolicy(AuthorizationPolicyNames.AdminOnly, policy =>
                policy.RequireRole(EUserRoles.Admin));

            // Admin role management
            options.AddPolicy(AuthorizationPolicyNames.AdminManageRoles, policy =>
                policy.RequireRole(EUserRoles.Admin));

            options.AddPolicy(AuthorizationPolicyNames.ProductDelete, policy =>
                policy.RequireRole(EUserRoles.Admin, EUserRoles.Manager));

            // Role-specific policy
            options.AddPolicy(AuthorizationPolicyNames.Staff.CreateProduct, policy =>
                policy.RequireAssertion(context =>
                    context.User.IsInRole(EUserRoles.Staff) &&
                    context.User.HasClaim(c => c.Type == AuthorizationClaimTypes.Permission && c.Value == EPermissions.CreateProduct)));

            // Tự động đăng ký tất cả các quyền từ EPermissions.
            // Nếu user có role Admin -> tự động validate THÀNH CÔNG cho mọi endpoint yêu cầu claim Permission.
            var permissionFields = typeof(EPermissions)
                .GetFields(BindingFlags.Public | BindingFlags.Static | BindingFlags.FlattenHierarchy)
                .Where(fi => fi.IsLiteral && !fi.IsInitOnly && fi.FieldType == typeof(string));

            foreach (var field in permissionFields)
            {
                var permissionName = (string)field.GetRawConstantValue();
                
                if (permissionName != null) 
                {
                    options.AddPolicy(permissionName, policy =>
                        policy.RequireAssertion(context =>
                            context.User.IsInRole(EUserRoles.Admin) ||
                            context.User.HasClaim(c => c.Type == AuthorizationClaimTypes.Permission && c.Value == permissionName)));
                }
            }
        }
    }
}

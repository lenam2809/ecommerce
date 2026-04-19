using Ecommerce.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using System.Linq;
using System.Reflection;

namespace Ecommerce.Application.Policies
{
    public static class AuthorizationPolicies
    {
        public static void ConfigurePolicies(AuthorizationOptions options)
        {
            // AdminOnly policy
            options.AddPolicy("AdminOnly", policy =>
                policy.RequireRole("Admin"));

            // Admin role management
            options.AddPolicy("Admin:ManageRoles", policy =>
                policy.RequireRole("Admin"));

            // Role-specific policy
            options.AddPolicy("Staff:CreateProduct", policy =>
                policy.RequireAssertion(context =>
                    context.User.IsInRole("Staff") &&
                    context.User.HasClaim(c => c.Type == "Permission" && c.Value == EPermissions.CreateProduct)));

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
                            context.User.IsInRole("Admin") || 
                            context.User.HasClaim(c => c.Type == "Permission" && c.Value == permissionName)));
                }
            }
        }
    }
}

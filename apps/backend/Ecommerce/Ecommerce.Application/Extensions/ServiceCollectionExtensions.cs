using Ecommerce.Application.Common.Behaviors;
using Ecommerce.Application.Common.Mappings;
using Ecommerce.Application.Features.Payments.VnPay;
using FluentValidation;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using System.Reflection;

namespace Ecommerce.Application.Extensions
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddApplication(this IServiceCollection services)
        {
            // Register AutoMapper with the mapping profile
            services.AddAutoMapper(cfg => cfg.AddMaps(typeof(MappingProfile).Assembly));

            // Register all validators from the assembly
            services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());

            // Register MediatR
            services.AddMediatR(cfg =>
            {
                // Register handlers from the assembly
                cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly());

                // Register pipeline behaviors in order of execution
                cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(LoggingBehavior<,>));           // 📝 Ghi log (First to capture everything)
                cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));        // 🟢 Validate
                cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(AuthorizationBehavior<,>));     // 🔐 Kiểm tra quyền
                cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(TransactionBehavior<,>));       // 💾 Quản lý Transaction tự động
                cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(CachingBehavior<,>));           // 📦 Trả từ cache nếu có

            });

            // Register VNPay Service
            services.AddScoped<IVnPayService, VnPayService>();

            return services;
        }
    }
}


using Ecommerce.Application.Common.Configs;
using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Services;
using Ecommerce.Domain.Services;
using Ecommerce.Infrastructure.Identity;
using Ecommerce.Infrastructure.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Ecommerce.Infrastructure.Extensions
{
    public static class AddServicesExtensions
    {
        public static IServiceCollection AddCustomServices(this IServiceCollection services, IConfiguration configuration)
        {
            // Configure Options
            services.Configure<FileStorageConfig>(configuration.GetSection("FileStorage"));

            services.AddScoped<ITokenService, TokenService>();
            services.AddScoped<ICurrentUserService, CurrentUserService>();
            services.AddScoped<IFileStorageService, FileStorageService>();
            services.AddScoped<INotificationService, NotificationService>();
            services.AddScoped<IExcelService, ExcelService>();
            services.AddScoped<IOrderHistoryService, OrderHistoryService>();
            services.AddScoped<IUserActivityService, UserActivityService>();
            services.AddScoped<IAccountLockService, AccountLockService>();
            services.AddScoped<CustomerLevelService>();
            services.AddScoped<PromoCodeService>();
            services.AddScoped<IMergeCartService, MergeCartService>();
            services.AddScoped<IShippingCalculator, ShippingCalculator>();

            return services;
        }
    }

}


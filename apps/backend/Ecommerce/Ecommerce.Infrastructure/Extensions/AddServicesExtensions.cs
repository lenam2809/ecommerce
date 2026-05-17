using Ecommerce.Application.Common.Configs;
using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Services;
using Ecommerce.Domain.Services;
using Ecommerce.Infrastructure.Cache;
using Ecommerce.Infrastructure.Identity;
using Ecommerce.Infrastructure.Payments.VnPay;
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
            services.Configure<SupabaseStorageConfig>(configuration.GetSection("SupabaseStorage"));
            services.Configure<VnPaySettings>(configuration.GetSection("VnPay"));

            services.AddScoped<ITokenService, TokenService>();
            services.AddScoped<ICurrentUserService, CurrentUserService>();
            services.AddScoped<IFileStorageService, SupabaseStorageService>();
            services.AddScoped<INotificationService, NotificationService>();
            services.AddScoped<IExcelService, ExcelService>();
            services.AddScoped<IOrderHistoryService, OrderHistoryService>();
            services.AddScoped<IUserActivityService, UserActivityService>();
            services.AddScoped<IAccountLockService, AccountLockService>();
            services.AddScoped<IEmailService, EmailService>();
            services.AddSingleton<IEmailQueue, EmailQueue>();
            services.AddSingleton<IEmailTemplateRenderer, FileEmailTemplateRenderer>();
            services.AddHostedService<EmailBackgroundService>();
            services.AddScoped<IPushNotificationService, PushNotificationService>();
            services.AddScoped<CustomerLevelService>();
            services.AddScoped<PromoCodeService>();
            services.AddScoped<IMergeCartService, MergeCartService>();
            services.AddScoped<IGuestCartService, RedisGuestCartService>();
            services.AddScoped<IShippingCalculator, ShippingCalculator>();
            services.AddSingleton<IOrderCodeGenerator, OrderCodeGenerator>();
            services.AddSingleton<IRmaCodeGenerator, RmaCodeGenerator>();
            services.AddScoped<IPaymentGateway, VnPayPaymentGateway>();

            return services;
        }
    }

}


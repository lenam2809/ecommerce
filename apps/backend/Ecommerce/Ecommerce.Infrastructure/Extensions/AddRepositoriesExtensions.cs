using Ecommerce.Domain.Interfaces;
using Ecommerce.Domain.Interfaces.Base;
using Ecommerce.Infrastructure.Persistence.Repositories;
using Ecommerce.Infrastructure.Persistence.Repositories.Base;
using Microsoft.Extensions.DependencyInjection;

namespace Ecommerce.Infrastructure.Extensions
{
    public static class AddRepositoriesExtensions
    {
        public static IServiceCollection AddRepositories(this IServiceCollection services)
        {
            services.AddScoped(typeof(IRepository<>), typeof(BaseRepository<>));
            services.AddScoped<IUnitOfWork, UnitOfWork>();

            // Add your specific repositories
            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<IProductRepository, ProductRepository>();
            services.AddScoped<ICategoryRepository, CategoryRepository>();
            services.AddScoped<IOrderRepository, OrderRepository>();
            services.AddScoped<IPermissionRepository, PermissionRepository>();
            services.AddScoped<IReviewRepository, ReviewRepository>();
            services.AddScoped<IBannerRepository, BannerRepository>();
            services.AddScoped<IBrandRepository, BrandRepository>();
            services.AddScoped<ICartRepository, CartRepository>();
            services.AddScoped<IWishlistRepository, WishlistRepository>();
            services.AddScoped<IOrderItemRepository, OrderItemRepository>();
            services.AddScoped<IRoleRepository, RoleRepository>();
            services.AddScoped<IPromoCodeRepository, PromoCodeRepository>();
            services.AddScoped<ICustomerAddressRepository, CustomerAddressRepository>();
            services.AddScoped<IReviewLikeRepository, ReviewLikeRepository>();
            services.AddScoped<ICategoryBrandRepository, CategoryBrandRepository>();
            services.AddScoped<ILogEntryRepository, LogEntryRepository>();
            services.AddScoped<IAuditLogRepository, AuditLogRepository>();
            services.AddScoped<IOrderHistoryRepository, OrderHistoryRepository>();
            services.AddScoped<IReviewReplyRepository, ReviewReplyRepository>();
            services.AddScoped<INotificationRepository, NotificationRepository>();
            services.AddScoped<IAccountLockRepository, AccountLockRepository>();
            services.AddScoped<IUserActivityRepository, UserActivityRepository>();

            // New: SKU/Variant & RMA repositories
            services.AddScoped<IProductVariantSkuRepository, ProductVariantSkuRepository>();
            services.AddScoped<IInventoryItemRepository, InventoryItemRepository>();
            services.AddScoped<IReturnRequestRepository, ReturnRequestRepository>();

            // Marquee
            services.AddScoped<IMarqueeRepository, MarqueeRepository>();

            return services;
        }
    }

}


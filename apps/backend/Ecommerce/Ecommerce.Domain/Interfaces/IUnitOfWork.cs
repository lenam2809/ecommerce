using Ecommerce.Domain.Interfaces.Base;

namespace Ecommerce.Domain.Interfaces
{
    public interface IUnitOfWork : IDisposable
    {
        IUserRepository Users { get; }
        IProductRepository Products { get; }
        ICategoryRepository Categories { get; }
        IOrderRepository Orders { get; }
        IPermissionRepository Permissions { get; }
        IRoleRepository Roles { get; }
        IBrandRepository Brands { get; }
        ICartRepository Carts { get; }
        IReviewRepository Reviews { get; }
        IWishlistRepository Wishlists { get; }
        IOrderItemRepository OrderItems { get; }

        IPromoCodeRepository PromoCodes { get; }
        IBannerRepository Banners { get; }

        ICustomerAddressRepository CustomerAddresses { get; }

        ICategoryBrandRepository CategoryBrands { get; }

        ILogEntryRepository LogEntries { get; }

        IAuditLogRepository AuditLogs { get; }
        IOrderHistoryRepository OrderHistories { get; }

        IReviewReplyRepository ReviewReplies { get; }
        INotificationRepository Notifications { get; }
        IAccountLockRepository AccountLocks { get; }
        IUserActivityRepository UserActivities { get; }

        // New: SKU/Variant & RMA
        IProductVariantSkuRepository ProductVariantSkus { get; }
        IInventoryItemRepository InventoryItems { get; }
        IReturnRequestRepository ReturnRequests { get; }

        IRepository<T> BaseRepository<T>() where T : class;

        Task<int> CompleteAsync(CancellationToken cancellationToken = default);
        Task<bool> SaveEntitiesAsync(CancellationToken cancellationToken = default);

        Task BeginTransactionAsync(CancellationToken cancellationToken = default);
        Task CommitTransactionAsync(CancellationToken cancellationToken = default);
        Task RollbackTransactionAsync(CancellationToken cancellationToken = default);

        Task<T> ExecuteStrategyAsync<T>(Func<Task<T>> operation, CancellationToken cancellationToken = default);

        bool HasActiveTransaction { get; }
    }
}


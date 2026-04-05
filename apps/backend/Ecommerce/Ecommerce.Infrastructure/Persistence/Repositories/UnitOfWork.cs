using Ecommerce.Domain.Interfaces;
using Ecommerce.Domain.Interfaces.Base;
using Ecommerce.Infrastructure.Persistence.Repositories.Base;

namespace Ecommerce.Infrastructure.Persistence.Repositories
{
    public class UnitOfWork(
        ApplicationDbContext context,
        IUserRepository userRepository,
        IProductRepository productRepository,
        ICategoryRepository categoryRepository,
        IOrderRepository orderRepository,
        IPermissionRepository permissionRepository,
        IBrandRepository brandRepository,
        ICartRepository cartRepository,
        IReviewRepository reviewRepository,
        IWishlistRepository wishlistRepository,
        IOrderItemRepository orderItemRepository,
        IRoleRepository roleRepository,
        IPromoCodeRepository promoCodeRepository,
        IBannerRepository bannerRepository,
        ICustomerAddressRepository customerAddressRepository,
        ICategoryBrandRepository categoryBrandRepository,
        ILogEntryRepository logEntryRepository,
        IAuditLogRepository auditLogRepository,
        IOrderHistoryRepository orderHistoryRepository,
        IReviewReplyRepository reviewReplyRepository,
        INotificationRepository notificationRepository,
        IAccountLockRepository accountLockRepository,
        IUserActivityRepository userActivityRepository,
        IProductVariantSkuRepository productVariantSkuRepository,
        IInventoryItemRepository inventoryItemRepository,
        IReturnRequestRepository returnRequestRepository) : IUnitOfWork
    {
        private readonly ApplicationDbContext _context = context;
        private readonly IUserRepository _userRepository = userRepository;
        private readonly IProductRepository _productRepository = productRepository;
        private readonly ICategoryRepository _categoryRepository = categoryRepository;
        private readonly IOrderRepository _orderRepository = orderRepository;
        private readonly IPermissionRepository _permissionRepository = permissionRepository;
        private readonly IBrandRepository _brandRepository = brandRepository;
        private readonly ICartRepository _cartRepository = cartRepository;
        private readonly IReviewRepository _reviewRepository = reviewRepository;
        private readonly IWishlistRepository _wishlistRepository = wishlistRepository;
        private readonly IOrderItemRepository _orderItemRepository = orderItemRepository;
        private readonly IRoleRepository _roleRepository = roleRepository;
        private readonly IPromoCodeRepository _promoCodeRepository = promoCodeRepository;
        private readonly IBannerRepository _bannerRepository = bannerRepository;
        private readonly ICustomerAddressRepository _customerAddressRepository = customerAddressRepository;
        private readonly ICategoryBrandRepository _categoryBrandRepository = categoryBrandRepository;
        private readonly ILogEntryRepository _logEntryRepository = logEntryRepository;
        private readonly IAuditLogRepository _auditLogRepository = auditLogRepository;
        private readonly IOrderHistoryRepository _orderHistoryRepository = orderHistoryRepository;
        private readonly IReviewReplyRepository _reviewReplyRepository = reviewReplyRepository;
        private readonly INotificationRepository _notificationRepository = notificationRepository;
        private readonly IAccountLockRepository _accountLockRepository = accountLockRepository;
        private readonly IUserActivityRepository _userActivityRepository = userActivityRepository;
        private readonly IProductVariantSkuRepository _productVariantSkuRepository = productVariantSkuRepository;
        private readonly IInventoryItemRepository _inventoryItemRepository = inventoryItemRepository;
        private readonly IReturnRequestRepository _returnRequestRepository = returnRequestRepository;

        public IUserRepository Users => _userRepository;
        public IProductRepository Products => _productRepository;
        public ICategoryRepository Categories => _categoryRepository;
        public IOrderRepository Orders => _orderRepository;
        public IPermissionRepository Permissions => _permissionRepository;
        public IBrandRepository Brands => _brandRepository;
        public ICartRepository Carts => _cartRepository;
        public IReviewRepository Reviews => _reviewRepository;
        public IWishlistRepository Wishlists => _wishlistRepository;
        public IOrderItemRepository OrderItems => _orderItemRepository;
        public IRoleRepository Roles => _roleRepository;
        public IPromoCodeRepository PromoCodes => _promoCodeRepository;
        public IBannerRepository Banners => _bannerRepository;
        public ICustomerAddressRepository CustomerAddresses => _customerAddressRepository;
        public ICategoryBrandRepository CategoryBrands => _categoryBrandRepository;
        public ILogEntryRepository LogEntries => _logEntryRepository;
        public IAuditLogRepository AuditLogs => _auditLogRepository;
        public IOrderHistoryRepository OrderHistories => _orderHistoryRepository;
        public IReviewReplyRepository ReviewReplies => _reviewReplyRepository;
        public INotificationRepository Notifications => _notificationRepository;
        public IAccountLockRepository AccountLocks => _accountLockRepository;
        public IUserActivityRepository UserActivities => _userActivityRepository;
        public IProductVariantSkuRepository ProductVariantSkus => _productVariantSkuRepository;
        public IInventoryItemRepository InventoryItems => _inventoryItemRepository;
        public IReturnRequestRepository ReturnRequests => _returnRequestRepository;

        public async Task<int> CompleteAsync(CancellationToken cancellationToken = default)
        {
            return await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task<bool> SaveEntitiesAsync(CancellationToken cancellationToken = default)
        {
            return await _context.SaveChangesAsync(cancellationToken) > 0;
        }

        public async Task BeginTransactionAsync(CancellationToken cancellationToken = default)
        {
            await _context.Database.BeginTransactionAsync(cancellationToken);
        }

        public async Task CommitTransactionAsync(CancellationToken cancellationToken = default)
        {
            await _context.Database.CommitTransactionAsync(cancellationToken);
        }

        public async Task RollbackTransactionAsync(CancellationToken cancellationToken = default)
        {
            if (_context.Database.CurrentTransaction != null)
            {
                await _context.Database.RollbackTransactionAsync(cancellationToken);
            }
        }

        public async Task<T> ExecuteStrategyAsync<T>(Func<Task<T>> operation, CancellationToken cancellationToken = default)
        {
            var strategy = _context.Database.CreateExecutionStrategy();
            return await strategy.ExecuteAsync(
                state: operation,
                operation: async (context, state, ct) => await state(),
                verifySucceeded: null,
                cancellationToken: cancellationToken);
        }

        public bool HasActiveTransaction => _context.Database.CurrentTransaction != null;

        public void ClearTracking()
        {
            _context.ChangeTracker.Clear();
        }

        public void Dispose()
        {
            // _context.Dispose(); // Tạm thời để DI container tự quản lý vòng đời
        }

        public IRepository<T> BaseRepository<T>() where T : class
        {
            return new BaseRepository<T>(_context);
        }
    }
}


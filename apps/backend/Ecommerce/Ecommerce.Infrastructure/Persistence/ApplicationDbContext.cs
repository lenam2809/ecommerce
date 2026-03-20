using Ecommerce.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using System.Reflection;

namespace Ecommerce.Infrastructure.Persistence
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser, Role, Guid,
        IdentityUserClaim<Guid>, UserRole, IdentityUserLogin<Guid>,
        IdentityRoleClaim<Guid>, IdentityUserToken<Guid>>
    {
        private readonly IPublisher _publisher;

        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options, IPublisher publisher) : base(options) 
        {
            _publisher = publisher;
        }

        // Design-time constructor (EF migrations) — no IPublisher needed
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) 
        {
            _publisher = null!;
        }

        public DbSet<Product> Products { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Brand> Brands { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<Permission> Permissions { get; set; }
        public DbSet<UserPermission> UserPermissions { get; set; }
        public DbSet<RolePermission> RolePermissions { get; set; }
        public DbSet<RefreshToken> RefreshTokens { get; set; }
        public DbSet<Review> Reviews { get; set; }
        public DbSet<ReviewImage> ReviewImages { get; set; }
        public DbSet<ProductImage> ProductImages { get; set; }
        public DbSet<ProductSpecification> ProductSpecifications { get; set; }
        public DbSet<Cart> Carts { get; set; }
        public DbSet<CartItem> CartItems { get; set; }
        public DbSet<Wishlist> Wishlists { get; set; }
        public DbSet<WishlistItem> WishlistItems { get; set; }
        public DbSet<AuditLog> AuditLogs { get; set; }
        public DbSet<LogEntry> LogEntries { get; set; }
        public DbSet<PerformanceLog> PerformanceLogs { get; set; }
        public DbSet<LogProperty> LogProperties { get; set; }
        public DbSet<Banner> Banners { get; set; }
        public DbSet<ProductVariants> ProductVariants { get; set; }
        public DbSet<ProductColor> ProductColors { get; set; }
        public DbSet<ProductSize> ProductSizes { get; set; }

        // New: SKU-based variant architecture
        public DbSet<ProductAttribute> ProductAttributes { get; set; }
        public DbSet<ProductAttributeValue> ProductAttributeValues { get; set; }
        public DbSet<ProductVariantSku> ProductVariantSkus { get; set; }
        public DbSet<SkuAttributeValue> SkuAttributeValues { get; set; }
        public DbSet<InventoryItem> InventoryItems { get; set; }

        public DbSet<About> Abouts { get; set; }
        public DbSet<Contact> Contacts { get; set; }
        public DbSet<PromoCode> PromoCodes { get; set; }
        public DbSet<ReviewLike> ReviewLikes { get; set; }

        public DbSet<CustomerAddress> CustomerAddresses { get; set; }
        public DbSet<OrderHistory> OrderHistories { get; set; }

        public DbSet<ReviewReply> ReviewReplies { get; set; }

        public DbSet<ReviewReplyLike> ReviewReplyLikes { get; set; }

        public DbSet<Notification> Notifications { get; set; }
        public DbSet<NotificationTemplate> NotificationTemplates { get; set; }
        public DbSet<NotificationSetting> NotificationSettings { get; set; }
        public DbSet<AccountLock> AccountLocks { get; set; }
        public DbSet<UserActivity> UserActivities { get; set; }

        // New: Return/Refund (RMA)
        public DbSet<ReturnRequest> ReturnRequests { get; set; }
        public DbSet<ReturnEvidence> ReturnEvidences { get; set; }
        public DbSet<ReturnStatusHistory> ReturnStatusHistories { get; set; }

        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            await DispatchDomainEvents();
            NormalizeDateTimesToUtc();
            RefreshConcurrencyTokens();
            return await base.SaveChangesAsync(cancellationToken);
        }

        private void NormalizeDateTimesToUtc()
        {
            foreach (var entry in ChangeTracker.Entries()
                         .Where(e => e.State is EntityState.Added or EntityState.Modified))
            {
                foreach (var property in entry.Properties)
                {
                    if (property.Metadata.ClrType == typeof(DateTime) || property.Metadata.ClrType == typeof(DateTime?))
                    {
                        var currentValue = (DateTime?)property.CurrentValue;
                        if (currentValue.HasValue)
                        {
                            property.CurrentValue = NormalizeToUtc(currentValue.Value);
                        }
                    }
                }
            }
        }

        private static DateTime NormalizeToUtc(DateTime value)
        {
            return value.Kind switch
            {
                DateTimeKind.Utc => value,
                DateTimeKind.Local => value.ToUniversalTime(),
                _ => DateTime.SpecifyKind(value, DateTimeKind.Utc)
            };
        }

        private void RefreshConcurrencyTokens()
        {
            foreach (var entry in ChangeTracker.Entries<BaseEntity>()
                         .Where(e => e.State is EntityState.Added or EntityState.Modified))
            {
                entry.Entity.ConcurrencyToken = Guid.NewGuid().ToByteArray();
            }
        }

        private async Task DispatchDomainEvents()
        {
            var entities = ChangeTracker
                .Entries<Ecommerce.Domain.Interfaces.Base.IHasDomainEvents>()
                .Where(e => e.Entity.DomainEvents.Any())
                .Select(e => e.Entity);

            var domainEvents = entities
                .SelectMany(e => e.DomainEvents)
                .ToList();

            entities.ToList().ForEach(e => e.ClearDomainEvents());

            foreach (var domainEvent in domainEvents)
                await _publisher.Publish(domainEvent);
        }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // Apply configurations from assembly
            builder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

            // Rename Identity tables
            builder.Entity<ApplicationUser>().ToTable("Users");
            builder.Entity<Role>().ToTable("Roles");
            builder.Entity<UserRole>().ToTable("UserRoles");
            builder.Entity<IdentityUserClaim<Guid>>().ToTable("UserClaims");
            builder.Entity<IdentityUserLogin<Guid>>().ToTable("UserLogins");
            builder.Entity<IdentityRoleClaim<Guid>>().ToTable("RoleClaims");
            builder.Entity<IdentityUserToken<Guid>>().ToTable("UserTokens");

            // Configure UserRole relationship
            builder.Entity<RolePermission>(entity =>
            {
                entity.HasKey(rp => new { rp.RoleId, rp.PermissionId });

                entity.HasOne(rp => rp.Role)
                      .WithMany(r => r.RolePermissions)
                      .HasForeignKey(rp => rp.RoleId);

                entity.HasOne(rp => rp.Permission)
                      .WithMany(p => p.RolePermissions)
                      .HasForeignKey(rp => rp.PermissionId);
            });

            builder.Entity<UserPermission>(entity =>
            {
                entity.HasKey(rp => new { rp.ApplicationUserId, rp.PermissionId });

                entity.HasOne(up => up.ApplicationUser)
                    .WithMany(r => r.UserPermissions)
                    .HasForeignKey(up => up.ApplicationUserId);

                entity.HasOne(up => up.Permission)
                    .WithMany(p => p.UserPermissions)
                    .HasForeignKey(up => up.PermissionId);
            });

            builder.Entity<RolePermission>()
                .HasQueryFilter(rp => !rp.Permission.IsDeleted);

            builder.Entity<UserPermission>()
                .HasQueryFilter(up => !up.Permission.IsDeleted);

            builder.Entity<UserRole>(userRole =>
            {
                userRole.HasKey(ur => new { ur.UserId, ur.RoleId });

                userRole.HasOne(ur => ur.User)
                        .WithMany(u => u.UserRoles)
                        .HasForeignKey(ur => ur.UserId)
                        .IsRequired()
                        .OnDelete(DeleteBehavior.Cascade);

                userRole.HasOne(ur => ur.Role)
                        .WithMany(r => r.UserRoles)
                        .HasForeignKey(ur => ur.RoleId)
                        .IsRequired();
            });

            // Configure RefreshToken relationship
            builder.Entity<RefreshToken>()
                .HasOne(rt => rt.ApplicationUser)
                .WithMany(u => u.RefreshTokens)
                .HasForeignKey(rt => rt.ApplicationUserId);

            builder.Entity<CartItem>(entity =>
            {
                entity.HasOne(ci => ci.Cart)
                      .WithMany(c => c.CartItems)
                      .HasForeignKey(ci => ci.CartId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(ci => ci.Product)
                      .WithMany()
                      .HasForeignKey(ci => ci.ProductId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            builder.Entity<CartItem>(entity =>
            {
                entity.HasKey(ci => new { ci.CartId, ci.ProductId });

                entity.HasOne(ci => ci.Cart)
                      .WithMany(c => c.CartItems)
                      .HasForeignKey(ci => ci.CartId)
                      .OnDelete(DeleteBehavior.Cascade); // Keep cascade for Cart

                entity.HasOne(ci => ci.Product)
                      .WithMany()
                      .HasForeignKey(ci => ci.ProductId)
                      .OnDelete(DeleteBehavior.NoAction); // Change to NoAction for Product
            });

            builder.Entity<OrderItem>(entity =>
            {
                entity.HasKey(ci => ci.Id);

                entity.HasOne(ci => ci.Order)
                      .WithMany(c => c.OrderItems)
                      .HasForeignKey(ci => ci.OrderId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(ci => ci.Product)
                      .WithMany()
                      .HasForeignKey(ci => ci.ProductId)
                      .OnDelete(DeleteBehavior.NoAction);

                entity.HasOne(ci => ci.ProductVariantSku)
                      .WithMany()
                      .HasForeignKey(ci => ci.ProductVariantSkuId)
                      .OnDelete(DeleteBehavior.NoAction)
                      .IsRequired(false);
            });

            builder.Entity<LogProperty>()
                .HasOne<LogEntry>()
                .WithMany(e => e.Properties)
                .HasForeignKey(p => p.LogEntryId);

            // Add query filters for soft delete

            builder.Entity<CartItem>()
                .HasQueryFilter(rp => !rp.Cart.IsDeleted);

            builder.Entity<OrderItem>()
                .HasQueryFilter(rp => !rp.Order.IsDeleted);

            builder.Entity<WishlistItem>()
                .HasQueryFilter(rp => !rp.Product.IsDeleted);

        }
    }
}


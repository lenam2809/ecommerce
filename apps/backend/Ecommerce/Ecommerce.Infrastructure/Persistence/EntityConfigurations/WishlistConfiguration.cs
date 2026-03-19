using Ecommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Infrastructure.Persistence.EntityConfigurations
{
    // Cấu hình cho Wishlist
    public class WishlistConfiguration : IEntityTypeConfiguration<Wishlist>
    {
        public void Configure(EntityTypeBuilder<Wishlist> builder)
        {
            builder.ToTable("Wishlists");

            // Cấu hình quan hệ với User
            builder.HasOne(w => w.ApplicationUser)
                   .WithMany()
                   .HasForeignKey(w => w.ApplicationUserId)
                   .OnDelete(DeleteBehavior.Cascade);

            // Cấu hình quan hệ với WishlistItem
            builder.HasMany(w => w.WishlistItems)
                   .WithOne(wi => wi.Wishlist)
                   .HasForeignKey(wi => wi.WishlistId)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
}


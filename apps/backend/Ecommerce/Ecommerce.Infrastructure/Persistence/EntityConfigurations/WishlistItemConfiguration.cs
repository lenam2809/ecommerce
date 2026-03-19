using Ecommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Infrastructure.Persistence.EntityConfigurations
{
    // Cấu hình cho WishlistItem
    public class WishlistItemConfiguration : IEntityTypeConfiguration<WishlistItem>
    {
        public void Configure(EntityTypeBuilder<WishlistItem> builder)
        {
            builder.ToTable("WishlistItems");

            // Khóa chính composite
            builder.HasKey(wi => new { wi.WishlistId, wi.ProductId });

            // Cấu hình quan hệ
            builder.HasOne(wi => wi.Wishlist)
                   .WithMany(w => w.WishlistItems)
                   .HasForeignKey(wi => wi.WishlistId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(wi => wi.Product)
                   .WithMany()
                   .HasForeignKey(wi => wi.ProductId)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}


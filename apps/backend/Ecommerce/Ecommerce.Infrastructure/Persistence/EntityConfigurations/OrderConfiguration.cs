using Ecommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Infrastructure.Persistence.EntityConfigurations
{
    // Cấu hình cho Order
    public class OrderConfiguration : IEntityTypeConfiguration<Order>
    {
        public void Configure(EntityTypeBuilder<Order> builder)
        {
            builder.ToTable("Orders");

            // Validation cho các trường
            builder.Property(o => o.TotalAmount)
                   .HasColumnType("decimal(18,2)")
                   .IsRequired();

            builder.Property(o => o.ShippingAddress)
                   .IsRequired()
                   .HasMaxLength(500);

            builder.Property(o => o.Phone)
                   .HasMaxLength(20);

            builder.Property(o => o.Email)
                   .HasMaxLength(100);

            builder.Property(o => o.GuestEmail)
                   .HasMaxLength(200);

            builder.Property(o => o.GuestName)
                   .HasMaxLength(100);

            builder.Property(o => o.GuestId)
                   .HasMaxLength(64);

            // Cấu hình quan hệ
            builder.HasOne(o => o.ApplicationUser)
                   .WithMany(u => u.Orders)
                   .HasForeignKey(o => o.ApplicationUserId)
                   .OnDelete(DeleteBehavior.Restrict);

            // Cấu hình quan hệ với OrderItem
            builder.HasMany(o => o.OrderItems)
                   .WithOne(oi => oi.Order)
                   .HasForeignKey(oi => oi.OrderId)
                   .OnDelete(DeleteBehavior.Cascade);

            // Index hóa
            builder.HasIndex(o => new { o.ApplicationUserId, o.OrderDate });
            builder.HasIndex(o => new { o.GuestId, o.OrderDate });
        }
    }
}


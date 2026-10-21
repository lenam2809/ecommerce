using Ecommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Infrastructure.Persistence.EntityConfigurations
{
    // Cấu hình cho OrderItem
    public class OrderItemConfiguration : IEntityTypeConfiguration<OrderItem>
    {
        public void Configure(EntityTypeBuilder<OrderItem> builder)
        {
            builder.ToTable("OrderItems");

            builder.HasKey(oi => oi.Id);

            // Validation cho các trường
            builder.Property(oi => oi.Quantity)
                   .IsRequired();

            builder.Property(oi => oi.UnitPrice)
                   .HasColumnType("decimal(18,2)")
                   .IsRequired();

            builder.Property(oi => oi.AddOnName)
                   .HasMaxLength(255);

            builder.Property(oi => oi.AddOnPrice)
                   .HasColumnType("decimal(18,2)")
                   .HasDefaultValue(0);

            builder.Property(oi => oi.WarrantyMonths)
                   .HasDefaultValue(24);

            // Cấu hình quan hệ
            builder.HasOne(oi => oi.Order)
                   .WithMany(o => o.OrderItems)
                   .HasForeignKey(oi => oi.OrderId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(oi => oi.Product)
                   .WithMany()
                   .HasForeignKey(oi => oi.ProductId)
                   .OnDelete(DeleteBehavior.NoAction);

            builder.HasOne(oi => oi.ProductVariantSku)
                   .WithMany()
                   .HasForeignKey(oi => oi.ProductVariantSkuId)
                   .OnDelete(DeleteBehavior.NoAction)
                   .IsRequired(false);

            builder.HasOne(oi => oi.AddOn)
                   .WithMany()
                   .HasForeignKey(oi => oi.AddOnId)
                   .OnDelete(DeleteBehavior.SetNull)
                   .IsRequired(false);
        }
    }
}

using Ecommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Infrastructure.Persistence.EntityConfigurations
{
    // Cấu hình cho Shipping
    public class ShippingConfiguration : IEntityTypeConfiguration<Shipping>
    {
        public void Configure(EntityTypeBuilder<Shipping> builder)
        {
            builder.ToTable("Shippings");

            // Validation cho các trường
            builder.Property(s => s.TrackingNumber)
                   .HasMaxLength(100);

            builder.Property(s => s.ShippingProvider)
                   .HasMaxLength(100);

            builder.Property(s => s.ShippingCost)
                   .HasColumnType("decimal(18,2)");

            // Cấu hình quan hệ
            builder.HasOne(s => s.Order)
                   .WithMany()
                   .HasForeignKey(s => s.OrderId)
                   .OnDelete(DeleteBehavior.Restrict);

            // Index hóa
            builder.HasIndex(s => s.TrackingNumber);
        }
    }
}


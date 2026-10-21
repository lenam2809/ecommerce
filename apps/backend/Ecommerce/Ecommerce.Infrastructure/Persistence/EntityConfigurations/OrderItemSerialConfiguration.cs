using Ecommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Infrastructure.Persistence.EntityConfigurations
{
    public class OrderItemSerialConfiguration : IEntityTypeConfiguration<OrderItemSerial>
    {
        public void Configure(EntityTypeBuilder<OrderItemSerial> builder)
        {
            builder.ToTable("OrderItemSerials");

            builder.Property(s => s.SerialNumber)
                   .IsRequired()
                   .HasMaxLength(100);

            builder.Property(s => s.Imei)
                   .HasMaxLength(50);

            builder.Property(s => s.WarrantyMonths)
                   .HasDefaultValue(24);

            builder.Property(s => s.WarrantyStatus)
                   .IsRequired()
                   .HasMaxLength(50)
                   .HasDefaultValue("Active");

            // Relationships with DeleteBehavior.Restrict for OrderItem to protect transaction history
            builder.HasOne(s => s.OrderItem)
                   .WithMany(oi => oi.OrderItemSerials)
                   .HasForeignKey(s => s.OrderItemId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(s => s.InventoryItem)
                   .WithMany()
                   .HasForeignKey(s => s.InventoryItemId)
                   .OnDelete(DeleteBehavior.SetNull)
                   .IsRequired(false);

            // B-Tree Indexes
            builder.HasIndex(s => s.SerialNumber);
            builder.HasIndex(s => s.Imei);
            builder.HasIndex(s => s.OrderItemId);
        }
    }
}

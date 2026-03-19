using Ecommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Infrastructure.Persistence.EntityConfigurations
{
    public class InventoryItemConfiguration : IEntityTypeConfiguration<InventoryItem>
    {
        public void Configure(EntityTypeBuilder<InventoryItem> builder)
        {
            builder.ToTable("InventoryItems");

            builder.Property(i => i.SerialNumber)
                   .IsRequired()
                   .HasMaxLength(100);

            builder.Property(i => i.BatchCode)
                   .HasMaxLength(50);

            builder.Property(i => i.Notes)
                   .HasMaxLength(500);

            builder.Property(i => i.Status)
                   .IsRequired();

            builder.HasOne(i => i.ProductVariantSku)
                   .WithMany(s => s.InventoryItems)
                   .HasForeignKey(i => i.ProductVariantSkuId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(i => i.OrderItem)
                   .WithMany(oi => oi.AssignedSerials)
                   .HasForeignKey(i => i.OrderItemId)
                   .OnDelete(DeleteBehavior.NoAction) // Avoid cascade cycle
                   .IsRequired(false);

            // Indexes
            builder.HasIndex(i => i.SerialNumber).IsUnique();
            builder.HasIndex(i => i.ProductVariantSkuId);
            builder.HasIndex(i => i.Status);
            builder.HasIndex(i => i.OrderItemId).HasFilter("[OrderItemId] IS NOT NULL");
        }
    }
}

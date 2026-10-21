using Ecommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Infrastructure.Persistence.EntityConfigurations
{
    public class ShowroomInventoryConfiguration : IEntityTypeConfiguration<ShowroomInventory>
    {
        public void Configure(EntityTypeBuilder<ShowroomInventory> builder)
        {
            builder.ToTable("ShowroomInventories");

            // Composite primary key (ShowroomId, ProductId)
            builder.HasKey(si => new { si.ShowroomId, si.ProductId });

            builder.Property(si => si.Quantity)
                   .HasDefaultValue(0);

            builder.Ignore(si => si.StockQuantity);

            builder.Property(si => si.ReservedQuantity)
                   .HasDefaultValue(0);

            builder.Property(si => si.IsAvailableFor2hDelivery)
                   .HasDefaultValue(true);

            // Relationships with DeleteBehavior.Restrict
            builder.HasOne(si => si.Showroom)
                   .WithMany(s => s.Inventories)
                   .HasForeignKey(si => si.ShowroomId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(si => si.Product)
                   .WithMany(p => p.ShowroomInventories)
                   .HasForeignKey(si => si.ProductId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(si => si.ProductVariantSku)
                   .WithMany()
                   .HasForeignKey(si => si.ProductVariantSkuId)
                   .OnDelete(DeleteBehavior.Restrict)
                   .IsRequired(false);

            // B-Tree Indexes
            builder.HasIndex(si => si.ProductId);
            builder.HasIndex(si => si.ProductVariantSkuId);
        }
    }
}

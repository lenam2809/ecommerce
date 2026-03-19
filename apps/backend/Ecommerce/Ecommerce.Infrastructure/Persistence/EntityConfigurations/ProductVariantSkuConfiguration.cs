using Ecommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Infrastructure.Persistence.EntityConfigurations
{
    public class ProductVariantSkuConfiguration : IEntityTypeConfiguration<ProductVariantSku>
    {
        public void Configure(EntityTypeBuilder<ProductVariantSku> builder)
        {
            builder.ToTable("ProductVariantSkus");

            builder.Property(s => s.Sku)
                   .IsRequired()
                   .HasMaxLength(100);

            builder.Property(s => s.Price)
                   .HasColumnType("decimal(18,2)")
                   .IsRequired();

            builder.Property(s => s.SalePrice)
                   .HasColumnType("decimal(18,2)");

            builder.Property(s => s.Barcode)
                   .HasMaxLength(50);

            builder.HasOne(s => s.Product)
                   .WithMany(p => p.VariantSkus)
                   .HasForeignKey(s => s.ProductId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(s => s.AttributeValues)
                   .WithOne(av => av.ProductVariantSku)
                   .HasForeignKey(av => av.ProductVariantSkuId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(s => s.InventoryItems)
                   .WithOne(i => i.ProductVariantSku)
                   .HasForeignKey(i => i.ProductVariantSkuId)
                   .OnDelete(DeleteBehavior.Cascade);

            // Indexes
            builder.HasIndex(s => s.Sku).IsUnique();
            builder.HasIndex(s => s.ProductId);
            builder.HasIndex(s => s.Barcode).IsUnique().HasFilter("[Barcode] IS NOT NULL");
        }
    }
}

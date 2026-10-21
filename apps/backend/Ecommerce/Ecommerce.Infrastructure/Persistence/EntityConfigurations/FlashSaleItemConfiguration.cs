using Ecommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Infrastructure.Persistence.EntityConfigurations
{
    public class FlashSaleItemConfiguration : IEntityTypeConfiguration<FlashSaleItem>
    {
        public void Configure(EntityTypeBuilder<FlashSaleItem> builder)
        {
            builder.ToTable("FlashSaleItems");

            builder.Property(fsi => fsi.FlashSalePrice)
                   .HasColumnType("decimal(18,2)")
                   .IsRequired();

            builder.Property(fsi => fsi.OriginalPrice)
                   .HasColumnType("decimal(18,2)")
                   .IsRequired();

            builder.Property(fsi => fsi.TotalQuota)
                   .IsRequired();

            builder.Ignore(fsi => fsi.FlashPrice);
            builder.Ignore(fsi => fsi.QuantityLimit);
            builder.Ignore(fsi => fsi.SoldQuantity);

            builder.Property(fsi => fsi.SoldCount)
                   .HasDefaultValue(0);

            builder.Property(fsi => fsi.MaxPerCustomer)
                   .HasDefaultValue(1);

            builder.Property(fsi => fsi.IsHeroFeatured)
                   .HasDefaultValue(false);

            builder.Property(fsi => fsi.BadgeText)
                   .HasMaxLength(50);

            builder.Property(fsi => fsi.DisplayOrder)
                   .HasDefaultValue(0);

            // Relationships
            builder.HasOne(fsi => fsi.FlashSale)
                   .WithMany(fs => fs.Items)
                   .HasForeignKey(fsi => fsi.FlashSaleId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(fsi => fsi.Product)
                   .WithMany()
                   .HasForeignKey(fsi => fsi.ProductId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(fsi => fsi.ProductVariantSku)
                   .WithMany()
                   .HasForeignKey(fsi => fsi.ProductVariantSkuId)
                   .OnDelete(DeleteBehavior.SetNull)
                   .IsRequired(false);

            // Indexes
            builder.HasIndex(fsi => new { fsi.FlashSaleId, fsi.ProductId });
            builder.HasIndex(fsi => fsi.IsHeroFeatured);
        }
    }
}

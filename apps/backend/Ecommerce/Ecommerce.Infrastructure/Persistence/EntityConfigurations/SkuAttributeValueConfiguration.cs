using Ecommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Infrastructure.Persistence.EntityConfigurations
{
    public class SkuAttributeValueConfiguration : IEntityTypeConfiguration<SkuAttributeValue>
    {
        public void Configure(EntityTypeBuilder<SkuAttributeValue> builder)
        {
            builder.ToTable("SkuAttributeValues");

            builder.HasKey(sav => sav.Id);

            builder.HasOne(sav => sav.ProductVariantSku)
                   .WithMany(s => s.AttributeValues)
                   .HasForeignKey(sav => sav.ProductVariantSkuId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(sav => sav.ProductAttributeValue)
                   .WithMany(av => av.SkuAttributeValues)
                   .HasForeignKey(sav => sav.ProductAttributeValueId)
                   .OnDelete(DeleteBehavior.NoAction); // Avoid cascade cycle

            builder.HasIndex(sav => new { sav.ProductVariantSkuId, sav.ProductAttributeValueId }).IsUnique();

            builder.HasQueryFilter(sav => !sav.ProductAttributeValue.IsDeleted);
        }
    }
}

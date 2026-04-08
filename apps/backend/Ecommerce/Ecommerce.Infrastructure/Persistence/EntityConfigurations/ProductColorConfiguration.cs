using Ecommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Infrastructure.Persistence.EntityConfigurations
{
    public class ProductColorConfiguration : IEntityTypeConfiguration<ProductColor>
    {
        public void Configure(EntityTypeBuilder<ProductColor> builder)
        {
            builder.ToTable("ProductColors");

            builder.HasOne(pc => pc.ProductVariant)
                .WithMany(pv => pv.Colors)
                .HasForeignKey(pc => pc.ProductVariantId);

            builder.HasQueryFilter(pc => !pc.ProductVariant.IsDeleted);
        }
    }
}


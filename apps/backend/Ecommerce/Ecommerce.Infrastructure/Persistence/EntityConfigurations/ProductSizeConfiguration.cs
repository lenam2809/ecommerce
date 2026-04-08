using Ecommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Infrastructure.Persistence.EntityConfigurations
{
    public class ProductSizeConfiguration : IEntityTypeConfiguration<ProductSize>
    {
        public void Configure(EntityTypeBuilder<ProductSize> builder)
        {
            builder.ToTable("ProductSizes");

            builder.HasOne(ps => ps.ProductVariant)
                .WithMany(pv => pv.Sizes)
                .HasForeignKey(ps => ps.ProductVariantId);

            builder.HasQueryFilter(ps => !ps.ProductVariant.IsDeleted);
        }
    }
}


using Ecommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Infrastructure.Persistence.EntityConfigurations
{
    public class CategoryBrandConfiguration : IEntityTypeConfiguration<CategoryBrand>
    {
        public void Configure(EntityTypeBuilder<CategoryBrand> builder)
        {
            builder.ToTable("CategoryBrands");

            // Composite primary key
            builder.HasKey(cb => new { cb.CategoryId, cb.BrandId });

            // Configure relationships
            builder.HasOne(cb => cb.Category)
                   .WithMany(c => c.CategoryBrands)
                   .HasForeignKey(cb => cb.CategoryId);

            builder.HasOne(cb => cb.Brand)
                   .WithMany(b => b.CategoryBrands)
                   .HasForeignKey(cb => cb.BrandId);

            builder.Property(cb => cb.LinkedAt)
                   .HasDefaultValueSql("now()");

            builder.HasQueryFilter(cb => !cb.Brand.IsDeleted && !cb.Category.IsDeleted);
        }
    }
}

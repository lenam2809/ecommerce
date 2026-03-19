using Ecommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Infrastructure.Persistence.EntityConfigurations
{
    public class BrandConfiguration : IEntityTypeConfiguration<Brand>
    {
        public void Configure(EntityTypeBuilder<Brand> builder)
        {
            builder.ToTable("Brands");

            builder.Property(b => b.Code)
                  .IsRequired()
                  .HasMaxLength(20);

            builder.Property(b => b.Name)
                   .IsRequired()
                   .HasMaxLength(100);

            builder.Property(b => b.Description)
                   .HasMaxLength(500);

            builder.Property(b => b.LogoUrl)
                   .HasMaxLength(500);

            builder.Property(b => b.Slug)
                   .IsRequired()
                   .HasMaxLength(100);

            builder.Property(b => b.IsActive)
                   .HasDefaultValue(true);

            // Unique constraint for brand name
            builder.HasIndex(b => b.Name)
                   .IsUnique();

            // Configure relationship with Product
            builder.HasMany(b => b.Products)
                   .WithOne(p => p.Brand)
                   .HasForeignKey(p => p.BrandId)
                   .OnDelete(DeleteBehavior.Restrict);

            // Configure many-to-many relationship with Category through CategoryBrand
            builder.HasMany(b => b.CategoryBrands)
                   .WithOne(cb => cb.Brand)
                   .HasForeignKey(cb => cb.BrandId)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
}

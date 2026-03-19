using Ecommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Infrastructure.Persistence.EntityConfigurations
{
    public class CategoryConfiguration : IEntityTypeConfiguration<Category>
    {
        public void Configure(EntityTypeBuilder<Category> builder)
        {
            builder.ToTable("Categories");

            builder.Property(c => c.Code)
                  .IsRequired()
                  .HasMaxLength(50);

            builder.Property(c => c.Name)
                   .IsRequired()
                   .HasMaxLength(100);

            builder.Property(c => c.Description)
                   .HasMaxLength(500);

            builder.Property(c => c.Image)
                   .HasMaxLength(500);

            builder.Property(c => c.Slug)
                   .IsRequired()
                   .HasMaxLength(100);

            builder.Property(c => c.IsActive)
                   .HasDefaultValue(true);

            builder.Property(c => c.DisplayOrder)
                   .HasDefaultValue(0);

            // Configure relationships
            builder.HasMany(c => c.Products)
                   .WithOne(p => p.Category)
                   .HasForeignKey(p => p.CategoryId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(c => c.Parent)
                   .WithMany(c => c.Children)
                   .HasForeignKey(c => c.ParentId)
                   .OnDelete(DeleteBehavior.Restrict);

            // Configure many-to-many relationship with Brand through CategoryBrand
            builder.HasMany(c => c.CategoryBrands)
                   .WithOne(cb => cb.Category)
                   .HasForeignKey(cb => cb.CategoryId)
                   .OnDelete(DeleteBehavior.Cascade);

            // Configure indexes
            builder.HasIndex(c => c.Name)
                   .IsUnique();
        }
    }
}

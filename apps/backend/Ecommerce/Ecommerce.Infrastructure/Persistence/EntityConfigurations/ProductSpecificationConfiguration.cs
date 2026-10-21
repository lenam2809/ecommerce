using Ecommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Infrastructure.Persistence.EntityConfigurations
{
    // Cấu hình cho ProductSpecification
    public class ProductSpecificationConfiguration : IEntityTypeConfiguration<ProductSpecification>
    {
        public void Configure(EntityTypeBuilder<ProductSpecification> builder)
        {
            builder.ToTable("ProductSpecifications");

            // Validation cho các trường
            builder.Property(ps => ps.Name)
                   .IsRequired()
                   .HasMaxLength(100);

            builder.Property(ps => ps.Value)
                   .IsRequired()
                   .HasMaxLength(500);

            builder.Property(ps => ps.GroupName)
                   .IsRequired()
                   .HasMaxLength(100)
                   .HasDefaultValue("Chung");

            builder.Property(ps => ps.DisplayOrder)
                   .HasDefaultValue(0);

            builder.Property(ps => ps.IsHighlight)
                   .HasDefaultValue(false);

            builder.Property(ps => ps.IsKeySpec)
                   .HasDefaultValue(false);

            builder.Ignore(ps => ps.SpecKey);
            builder.Ignore(ps => ps.SpecValue);

            builder.Property(ps => ps.FilterKey)
                   .HasMaxLength(50);

            // B-Tree Indexes
            builder.HasIndex(ps => ps.FilterKey);
            builder.HasIndex(ps => ps.IsKeySpec);
            builder.HasIndex(ps => new { ps.ProductId, ps.GroupName });

            // Cấu hình quan hệ
            builder.HasOne(ps => ps.Product)
                   .WithMany(p => p.Specifications)
                   .HasForeignKey(ps => ps.ProductId)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
}

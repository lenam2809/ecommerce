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

            // Cấu hình quan hệ
            builder.HasOne(ps => ps.Product)
                   .WithMany(p => p.Specifications)
                   .HasForeignKey(ps => ps.ProductId)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
}


using Ecommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Infrastructure.Persistence.EntityConfigurations
{
    public class ProductAttributeConfiguration : IEntityTypeConfiguration<ProductAttribute>
    {
        public void Configure(EntityTypeBuilder<ProductAttribute> builder)
        {
            builder.ToTable("ProductAttributes");

            builder.Property(a => a.Name)
                   .IsRequired()
                   .HasMaxLength(100);

            builder.Property(a => a.DisplayOrder)
                   .IsRequired();

            builder.HasOne(a => a.Product)
                   .WithMany(p => p.Attributes)
                   .HasForeignKey(a => a.ProductId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(a => a.Values)
                   .WithOne(v => v.ProductAttribute)
                   .HasForeignKey(v => v.ProductAttributeId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasIndex(a => new { a.ProductId, a.Name }).IsUnique();
        }
    }
}

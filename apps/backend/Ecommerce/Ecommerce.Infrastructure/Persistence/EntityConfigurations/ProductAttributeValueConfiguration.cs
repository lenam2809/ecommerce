using Ecommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Infrastructure.Persistence.EntityConfigurations
{
    public class ProductAttributeValueConfiguration : IEntityTypeConfiguration<ProductAttributeValue>
    {
        public void Configure(EntityTypeBuilder<ProductAttributeValue> builder)
        {
            builder.ToTable("ProductAttributeValues");

            builder.Property(v => v.Value)
                   .IsRequired()
                   .HasMaxLength(200);

            builder.Property(v => v.ColorHex)
                   .HasMaxLength(10);

            builder.Property(v => v.ImageUrl)
                   .HasMaxLength(500);

            builder.Property(v => v.DisplayOrder)
                   .IsRequired();

            builder.HasOne(v => v.ProductAttribute)
                   .WithMany(a => a.Values)
                   .HasForeignKey(v => v.ProductAttributeId)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
}

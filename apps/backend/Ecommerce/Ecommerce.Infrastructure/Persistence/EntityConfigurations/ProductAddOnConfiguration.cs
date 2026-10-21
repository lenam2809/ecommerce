using Ecommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Infrastructure.Persistence.EntityConfigurations
{
    public class ProductAddOnConfiguration : IEntityTypeConfiguration<ProductAddOn>
    {
        public void Configure(EntityTypeBuilder<ProductAddOn> builder)
        {
            builder.ToTable("ProductAddOns");

            builder.Property(a => a.Code)
                   .IsRequired()
                   .HasMaxLength(50);

            builder.Property(a => a.Name)
                   .IsRequired()
                   .HasMaxLength(255);

            builder.Property(a => a.Description)
                   .HasMaxLength(1000);

            builder.Property(a => a.AddOnType)
                   .IsRequired()
                   .HasMaxLength(50);

            builder.Property(a => a.Price)
                   .HasColumnType("decimal(18,2)")
                   .IsRequired();

            builder.Property(a => a.OriginalPrice)
                   .HasColumnType("decimal(18,2)");

            builder.Property(a => a.IsActive)
                   .HasDefaultValue(true);

            builder.Property(a => a.DisplayOrder)
                   .HasDefaultValue(0);

            // Relationships
            builder.HasOne(a => a.Product)
                   .WithMany(p => p.AddOns)
                   .HasForeignKey(a => a.ProductId)
                   .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(a => a.Category)
                   .WithMany()
                   .HasForeignKey(a => a.CategoryId)
                   .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(a => a.Brand)
                   .WithMany()
                   .HasForeignKey(a => a.BrandId)
                   .OnDelete(DeleteBehavior.SetNull);

            // Indexes
            builder.HasIndex(a => a.Code);
            builder.HasIndex(a => a.ProductId);
        }
    }
}

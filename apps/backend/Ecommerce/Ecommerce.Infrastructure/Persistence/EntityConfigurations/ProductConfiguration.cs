using Ecommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Infrastructure.Persistence.EntityConfigurations
{
    // Cấu hình cho Product
    public class ProductConfiguration : IEntityTypeConfiguration<Product>
    {
        public void Configure(EntityTypeBuilder<Product> builder)
        {
            builder.ToTable("Products");

            // Validation cho các trường
            builder.Property(b => b.Code)
                  .IsRequired()
                  .HasMaxLength(20);

            builder.Property(p => p.Name)
                   .IsRequired()
                   .HasMaxLength(255);

            builder.Property(p => p.Price)
                   .HasColumnType("decimal(18,2)")
                   .IsRequired();

            builder.Property(p => p.SalePrice)
                   .HasColumnType("decimal(18,2)");

            builder.Property(p => p.Description)
                   .HasMaxLength(1000);

            builder.Property(p => p.Image)
                   .HasMaxLength(500);

            // Cấu hình quan hệ
            builder.HasOne(p => p.Category)
                   .WithMany(c => c.Products)
                   .HasForeignKey(p => p.CategoryId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(p => p.Brand)
                   .WithMany(b => b.Products)
                   .HasForeignKey(p => p.BrandId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(p => p.Variants)
                    .WithOne(v => v.Product)
                    .HasForeignKey<ProductVariants>(v => v.ProductId)
                    .OnDelete(DeleteBehavior.Cascade); // Xóa Product sẽ xóa luôn ProductVariants nếu cần


            // Index hóa
            builder.HasIndex(p => new { p.Name, p.Price })
                   .IncludeProperties(p => p.StockQuantity);

            builder.HasIndex(p => p.Slug)
                   .IsUnique()
                   .HasDatabaseName("IX_Products_Slug");

            builder.HasIndex(p => p.CategoryId)
                   .HasDatabaseName("IX_Products_CategoryId");

            builder.HasIndex(p => p.BrandId)
                   .HasDatabaseName("IX_Products_BrandId");
        }
    }
}


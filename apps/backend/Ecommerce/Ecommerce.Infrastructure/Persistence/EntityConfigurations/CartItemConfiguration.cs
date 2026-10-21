using Ecommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Infrastructure.Persistence.EntityConfigurations
{
    // Cấu hình cho CartItem
    public class CartItemConfiguration : IEntityTypeConfiguration<CartItem>
    {
        public void Configure(EntityTypeBuilder<CartItem> builder)
        {
            builder.ToTable("CartItems");

            // Surrogate Primary Key
            builder.HasKey(ci => ci.Id);
            builder.Property(ci => ci.Id)
                   .ValueGeneratedOnAdd();

            // Normalized Color & Size
            builder.Property(ci => ci.Color)
                   .IsRequired()
                   .HasMaxLength(50)
                   .HasDefaultValue(string.Empty);

            builder.Property(ci => ci.Size)
                   .IsRequired()
                   .HasMaxLength(50)
                   .HasDefaultValue(string.Empty);

            // Validation cho số lượng
            builder.Property(ci => ci.Quantity)
                   .IsRequired()
                   .HasDefaultValue(1);

            builder.Property(ci => ci.AddOnPrice)
                   .HasColumnType("decimal(18,2)")
                   .HasDefaultValue(0);

            // Unique index bảo đảm mỗi biến thể chỉ có tối đa một dòng trong mỗi giỏ hàng
            builder.HasIndex(ci => new { ci.CartId, ci.ProductId, ci.Color, ci.Size });

            // Cấu hình quan hệ
            builder.HasOne(ci => ci.Cart)
                   .WithMany(c => c.CartItems)
                   .HasForeignKey(ci => ci.CartId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(ci => ci.Product)
                   .WithMany()
                   .HasForeignKey(ci => ci.ProductId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(ci => ci.ProductVariantSku)
                   .WithMany()
                   .HasForeignKey(ci => ci.ProductVariantSkuId)
                   .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(ci => ci.AddOn)
                   .WithMany()
                   .HasForeignKey(ci => ci.AddOnId)
                   .OnDelete(DeleteBehavior.SetNull)
                   .IsRequired(false);
        }
    }
}

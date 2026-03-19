using Ecommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Infrastructure.Persistence.EntityConfigurations
{
    // Cấu hình cho Discount
    public class DiscountConfiguration : IEntityTypeConfiguration<Discount>
    {
        public void Configure(EntityTypeBuilder<Discount> builder)
        {
            builder.ToTable("Discounts");

            // Validation cho các trường
            builder.Property(d => d.Code)
                   .IsRequired()
                   .HasMaxLength(50);

            builder.Property(d => d.Description)
                   .HasMaxLength(200);

            builder.Property(d => d.DiscountPercentage)
                   .HasColumnType("decimal(5,2)");

            builder.Property(d => d.MaxDiscountAmount)
                   .HasColumnType("decimal(18,2)");

            // Unique constraint cho mã giảm giá
            builder.HasIndex(d => d.Code)
                   .IsUnique();

            // Cấu hình quan hệ sản phẩm được áp dụng
            builder.HasMany(d => d.ApplicableProducts)
                   .WithOne()
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}


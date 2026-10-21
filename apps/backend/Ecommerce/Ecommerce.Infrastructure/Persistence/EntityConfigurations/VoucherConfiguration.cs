using Ecommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Infrastructure.Persistence.EntityConfigurations
{
    public class VoucherConfiguration : IEntityTypeConfiguration<Voucher>
    {
        public void Configure(EntityTypeBuilder<Voucher> builder)
        {
            builder.ToTable("Vouchers");

            builder.Property(v => v.Code)
                   .IsRequired()
                   .HasMaxLength(50);

            builder.Property(v => v.DiscountType)
                   .IsRequired()
                   .HasMaxLength(20)
                   .HasDefaultValue("FixedAmount");

            builder.Property(v => v.DiscountValue)
                   .HasColumnType("decimal(18,2)")
                   .IsRequired();

            builder.Property(v => v.MinOrderValue)
                   .HasColumnType("decimal(18,2)")
                   .IsRequired();

            builder.Property(v => v.MaxDiscountAmount)
                   .HasColumnType("decimal(18,2)");

            builder.Property(v => v.UsageLimit)
                   .IsRequired();

            builder.Property(v => v.UsedCount)
                   .HasDefaultValue(0);

            builder.Property(v => v.IsActive)
                   .HasDefaultValue(true);

            // B-Tree Unique Index on Code
            builder.HasIndex(v => v.Code).IsUnique();
            builder.HasIndex(v => v.IsActive);
        }
    }
}

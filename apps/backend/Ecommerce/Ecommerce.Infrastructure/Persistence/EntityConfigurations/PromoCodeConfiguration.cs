using Ecommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Infrastructure.Persistence.EntityConfigurations
{
    public class PromoCodeConfiguration : IEntityTypeConfiguration<PromoCode>
    {
        public void Configure(EntityTypeBuilder<PromoCode> builder)
        {
            builder.ToTable("PromoCodes");

            // Property configurations
            builder.Property(p => p.Code)
                .IsRequired()
                .HasMaxLength(50);

            builder.Property(p => p.Description)
                .HasMaxLength(500);

            builder.Property(p => p.Type)
                .IsRequired()
                .HasConversion<string>(); // Store enum as string in database

            builder.Property(p => p.DiscountPercentage)
                .HasColumnType("decimal(5,2)") // Allows values up to 999.99%
                .HasDefaultValue(0);

            builder.Property(p => p.DiscountAmount)
                .HasColumnType("decimal(18,2)")
                .HasDefaultValue(0);

            builder.Property(p => p.FreeShipping)
                .HasDefaultValue(false);

            builder.Property(p => p.ValidFrom)
                .IsRequired();

            builder.Property(p => p.ValidTo)
                .IsRequired();

            builder.Property(p => p.UsageLimit)
                .HasDefaultValue(0); // 0 means unlimited

            builder.Property(p => p.TimesUsed)
                .HasDefaultValue(0);

            builder.Property(p => p.IsActive)
                .HasDefaultValue(true);

            // Indexes
            builder.HasIndex(p => p.Code)
                .IsUnique();

            builder.HasIndex(p => p.IsActive);

            builder.HasIndex(p => new { p.ValidFrom, p.ValidTo });

        }
    }
}


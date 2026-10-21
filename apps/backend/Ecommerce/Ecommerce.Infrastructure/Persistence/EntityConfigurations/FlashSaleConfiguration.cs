using Ecommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Infrastructure.Persistence.EntityConfigurations
{
    public class FlashSaleConfiguration : IEntityTypeConfiguration<FlashSale>
    {
        public void Configure(EntityTypeBuilder<FlashSale> builder)
        {
            builder.ToTable("FlashSales");

            builder.Property(fs => fs.Code)
                   .IsRequired()
                   .HasMaxLength(50);

            builder.Property(fs => fs.Title)
                   .IsRequired()
                   .HasMaxLength(200);

            builder.Property(fs => fs.Subtitle)
                   .HasMaxLength(300);

            builder.Property(fs => fs.BannerImageUrl)
                   .HasMaxLength(500);

            builder.Property(fs => fs.IsActive)
                   .HasDefaultValue(true);

            builder.Property(fs => fs.Priority)
                   .HasDefaultValue(0);

            builder.HasMany(fs => fs.Items)
                   .WithOne(fsi => fsi.FlashSale)
                   .HasForeignKey(fsi => fsi.FlashSaleId)
                   .OnDelete(DeleteBehavior.Cascade);

            // B-Tree Unique Index on Code
            builder.HasIndex(fs => fs.Code).IsUnique();
            builder.HasIndex(fs => new { fs.IsActive, fs.StartTime, fs.EndTime });
        }
    }
}

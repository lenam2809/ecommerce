using Ecommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Infrastructure.Persistence.EntityConfigurations
{
    public class OrderHistoryConfiguration : IEntityTypeConfiguration<OrderHistory>
    {
        public void Configure(EntityTypeBuilder<OrderHistory> builder)
        {
            builder.ToTable("OrderHistories");

            // Validation cho các trường
            builder.Property(oh => oh.FromStatus)
                    .IsRequired()
                    .HasConversion<string>();

            builder.Property(oh => oh.ToStatus)
                .IsRequired()
                .HasConversion<string>();

            builder.Property(oh => oh.Notes)
                .HasMaxLength(500);

            builder.Property(oh => oh.ChangedBy)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(oh => oh.ChangeSource)
                .IsRequired()
                .HasMaxLength(50);

            builder.Property(oh => oh.PreviousTotalAmount)
                .HasColumnType("decimal(18,2)");

            builder.Property(oh => oh.NewTotalAmount)
                .HasColumnType("decimal(18,2)");

            builder.Property(oh => oh.PreviousShippingAddress)
                .HasMaxLength(500);

            builder.Property(oh => oh.NewShippingAddress)
                .HasMaxLength(500);

            builder.Property(oh => oh.PreviousDiscountCode)
                .HasMaxLength(50);

            builder.Property(oh => oh.NewDiscountCode)
                .HasMaxLength(50);

            builder.Property(oh => oh.AdditionalData)
                .HasColumnType("nvarchar(max)");

            builder.HasOne(oh => oh.Order)
                .WithMany()
                .HasForeignKey(oh => oh.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            // Indexes for better performance
            builder.HasIndex(oh => oh.OrderId);
            builder.HasIndex(oh => oh.ChangedAt);
            builder.HasIndex(oh => new { oh.OrderId, oh.ChangedAt });
            builder.HasIndex(oh => oh.FromStatus);
            builder.HasIndex(oh => oh.ToStatus);
            builder.HasIndex(oh => oh.ChangeSource);
        }
    }
}


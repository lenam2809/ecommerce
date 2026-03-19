using Ecommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Infrastructure.Persistence.EntityConfigurations
{

    // Cấu hình cho Payment
    public class PaymentConfiguration : IEntityTypeConfiguration<Payment>
    {
        public void Configure(EntityTypeBuilder<Payment> builder)
        {
            builder.ToTable("Payments");

            // Validation cho các trường
            builder.Property(p => p.Amount)
                   .HasColumnType("decimal(18,2)")
                   .IsRequired();

            builder.Property(p => p.TransactionId)
                   .IsRequired()
                   .HasMaxLength(100);

            // Cấu hình quan hệ với Order
            builder.HasOne(p => p.Order)
                   .WithMany()
                   .HasForeignKey(p => p.OrderId)
                   .OnDelete(DeleteBehavior.Restrict);

            // Index hóa
            builder.HasIndex(p => p.TransactionId)
                   .IsUnique();
        }
    }

}


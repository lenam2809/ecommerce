using Ecommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Infrastructure.Persistence.EntityConfigurations
{
    public class PaymentTransactionConfiguration : IEntityTypeConfiguration<PaymentTransaction>
    {
        public void Configure(EntityTypeBuilder<PaymentTransaction> builder)
        {
            builder.ToTable("PaymentTransactions");

            builder.Property(p => p.TxnRef)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(p => p.Amount)
                .HasColumnType("decimal(18,2)")
                .IsRequired();

            builder.Property(p => p.ResponseCode)
                .HasMaxLength(20);

            builder.Property(p => p.Status)
                .HasConversion<int>()
                .IsRequired();

            builder.HasIndex(p => p.TxnRef)
                .IsUnique();
        }
    }
}

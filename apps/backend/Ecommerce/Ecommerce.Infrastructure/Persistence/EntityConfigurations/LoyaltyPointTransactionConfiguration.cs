using Ecommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Infrastructure.Persistence.EntityConfigurations
{
    public class LoyaltyPointTransactionConfiguration : IEntityTypeConfiguration<LoyaltyPointTransaction>
    {
        public void Configure(EntityTypeBuilder<LoyaltyPointTransaction> builder)
        {
            builder.ToTable("LoyaltyPointTransactions");

            builder.Property(t => t.TransactionType)
                   .IsRequired()
                   .HasMaxLength(50);

            builder.Property(t => t.Note)
                   .HasMaxLength(500);

            builder.Property(t => t.Points)
                   .IsRequired();

            // Protect user and order audit history with DeleteBehavior.Restrict
            builder.HasOne(t => t.User)
                   .WithMany(u => u.LoyaltyTransactions)
                   .HasForeignKey(t => t.UserId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(t => t.Order)
                   .WithMany()
                   .HasForeignKey(t => t.OrderId)
                   .OnDelete(DeleteBehavior.Restrict)
                   .IsRequired(false);

            builder.HasIndex(t => t.UserId);
            builder.HasIndex(t => t.OrderId);
            builder.HasIndex(t => t.CreatedAt);
        }
    }
}

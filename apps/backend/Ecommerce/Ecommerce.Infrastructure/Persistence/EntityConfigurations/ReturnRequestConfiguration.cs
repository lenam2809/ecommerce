using Ecommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Infrastructure.Persistence.EntityConfigurations
{
    public class ReturnRequestConfiguration : IEntityTypeConfiguration<ReturnRequest>
    {
        public void Configure(EntityTypeBuilder<ReturnRequest> builder)
        {
            builder.ToTable("ReturnRequests");

            builder.Property(r => r.Code)
                   .IsRequired()
                   .HasMaxLength(50);

            builder.Property(r => r.CustomerNote)
                   .HasMaxLength(2000);

            builder.Property(r => r.StaffNote)
                   .HasMaxLength(2000);

            builder.Property(r => r.RejectionReason)
                   .HasMaxLength(1000);

            builder.Property(r => r.RefundAmount)
                   .HasColumnType("decimal(18,2)");

            builder.Property(r => r.Type).IsRequired();
            builder.Property(r => r.Reason).IsRequired();
            builder.Property(r => r.Status).IsRequired();

            builder.HasOne(r => r.Order)
                   .WithMany()
                   .HasForeignKey(r => r.OrderId)
                   .OnDelete(DeleteBehavior.NoAction);

            builder.HasOne(r => r.Customer)
                   .WithMany()
                   .HasForeignKey(r => r.CustomerId)
                   .OnDelete(DeleteBehavior.NoAction);

            builder.HasMany(r => r.Evidences)
                   .WithOne(e => e.ReturnRequest)
                   .HasForeignKey(e => e.ReturnRequestId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(r => r.StatusHistory)
                   .WithOne(h => h.ReturnRequest)
                   .HasForeignKey(h => h.ReturnRequestId)
                   .OnDelete(DeleteBehavior.Cascade);

            // Indexes
            builder.HasIndex(r => r.Code).IsUnique();
            builder.HasIndex(r => r.CustomerId);
            builder.HasIndex(r => r.OrderId);
            builder.HasIndex(r => r.Status);
        }
    }
}

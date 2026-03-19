using Ecommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Infrastructure.Persistence.EntityConfigurations
{
    public class ReturnStatusHistoryConfiguration : IEntityTypeConfiguration<ReturnStatusHistory>
    {
        public void Configure(EntityTypeBuilder<ReturnStatusHistory> builder)
        {
            builder.ToTable("ReturnStatusHistories");

            builder.Property(h => h.Note)
                   .IsRequired()
                   .HasMaxLength(1000);

            builder.Property(h => h.Status).IsRequired();
            builder.Property(h => h.ChangedAt).IsRequired();

            builder.HasOne(h => h.ReturnRequest)
                   .WithMany(r => r.StatusHistory)
                   .HasForeignKey(h => h.ReturnRequestId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasIndex(h => h.ReturnRequestId);
        }
    }
}

using Ecommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Infrastructure.Persistence.EntityConfigurations
{
    public class ReturnRequestLogConfiguration : IEntityTypeConfiguration<ReturnRequestLog>
    {
        public void Configure(EntityTypeBuilder<ReturnRequestLog> builder)
        {
            builder.ToTable("ReturnRequestLogs");

            builder.Property(l => l.Step)
                   .HasDefaultValue(1);

            builder.Ignore(l => l.TechnicianNote);
            builder.Ignore(l => l.Author);

            builder.Property(l => l.Action)
                   .IsRequired()
                   .HasMaxLength(100);

            builder.Property(l => l.Title)
                   .IsRequired()
                   .HasMaxLength(200);

            builder.Property(l => l.ActorName)
                   .HasMaxLength(100);

            builder.Property(l => l.Location)
                   .HasMaxLength(200);

            builder.Property(l => l.Note)
                   .HasMaxLength(1000);

            builder.Property(l => l.ProcessingMethod)
                   .HasMaxLength(100);

            builder.HasOne(l => l.ReturnRequest)
                   .WithMany(r => r.Logs)
                   .HasForeignKey(l => l.ReturnRequestId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasIndex(l => l.ReturnRequestId);
            builder.HasIndex(l => l.LoggedAt);
        }
    }
}

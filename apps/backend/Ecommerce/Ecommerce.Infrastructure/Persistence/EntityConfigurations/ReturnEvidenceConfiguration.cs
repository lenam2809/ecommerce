using Ecommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Infrastructure.Persistence.EntityConfigurations
{
    public class ReturnEvidenceConfiguration : IEntityTypeConfiguration<ReturnEvidence>
    {
        public void Configure(EntityTypeBuilder<ReturnEvidence> builder)
        {
            builder.ToTable("ReturnEvidences");

            builder.Property(e => e.FileUrl)
                   .IsRequired()
                   .HasMaxLength(1000);

            builder.Property(e => e.FileType).IsRequired();

            builder.Property(e => e.Description)
                   .HasMaxLength(500);

            builder.HasOne(e => e.ReturnRequest)
                   .WithMany(r => r.Evidences)
                   .HasForeignKey(e => e.ReturnRequestId)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
